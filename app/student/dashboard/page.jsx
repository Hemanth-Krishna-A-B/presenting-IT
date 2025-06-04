"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PresentationViewer() {
  const [userId, setUserId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [currentPresentation, setCurrentPresentation] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [fade, setFade] = useState(true);
  const [currentId, setCurrentId] = useState(null);

  const currentIdRef = useRef(null); // ✅ Ref to track the latest currentId
  const channelRef = useRef(null);
  const imageContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep ref in sync with state
  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  // Fetch session data on first load
  useEffect(() => {
    const fetchSession = async () => {
      const sessionId = localStorage.getItem("SESSION");
      if (!sessionId) return;

      const { data, error } = await supabase
        .from("session")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("❌ Error fetching session:", error);
      } else {
        console.log("✅ Session data loaded:", data);
        setSessionData(data);
      }
    };

    fetchSession();
  }, []);

  // Reusable function to fetch a presentation by id
  const fetchPresentationById = async (pid) => {
    const { data: presentation, error } = await supabase
      .from("presentation")
      .select("*")
      .eq("id", pid)
      .single();

    if (error) {
      alert("❌ Error fetching presentation");
      return null;
    }
    return presentation;
  };

  // Fetch presentation when sessionData changes
  useEffect(() => {
    if (!sessionData?.present_id) return;

    const loadInitialPresentation = async () => {
      const presentation = await fetchPresentationById(sessionData.present_id);
      if (presentation) {
        setCurrentPresentation(presentation);
        setCurrentId(presentation.id);
        currentIdRef.current = presentation.id;
        setCurrentImageIndex(0);
      }
    };

    loadInitialPresentation();
  }, [sessionData]);

  // Fade effect on image change
  useEffect(() => {
    if (!currentPresentation?.image_url) return;

    setFade(false);

    const timeout = setTimeout(() => {
      const clampedIndex = Math.min(
        Math.max(currentImageIndex, 0),
        currentPresentation.image_url.length - 1
      );
      setCurrentImageUrl(currentPresentation.image_url[clampedIndex]);
      setFade(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [currentImageIndex, currentPresentation]);

  // Fetch user and room from localStorage
  useEffect(() => {
    const storedStudent = localStorage.getItem("STUDENT");
    const storedRoom = localStorage.getItem("ROOM-ID");

    if (storedStudent && storedRoom) {
      setUserId(JSON.parse(storedStudent)?.studentId);
      setRoomId(storedRoom);
    }
  }, []);

  // Handle slide and presentation change
  const handleSlideChange = async (pid, index) => {
    console.log("Received slide change for:", pid, index);
    console.log("Current ID in ref:", currentIdRef.current);

    if (currentIdRef.current !== pid) {
      if(pid == null){
        setCurrentId(null);
        setCurrentPresentation(null);
      }
      setCurrentId(pid);
      currentIdRef.current = pid;

      const presentation = await fetchPresentationById(pid);
      if (presentation) {
        setCurrentPresentation(presentation);
        setCurrentImageIndex(0);
      }
    } else {
      setCurrentImageIndex(index);
    }
  };

  // Subscribe to Supabase realtime channel
  useEffect(() => {
    if (!userId || !roomId) return;

    const channel = supabase.channel(`room:${roomId}`);

    channel.on("broadcast", { event: "slide-changed" }, (payload) => {
      const { presentationId, slideIndex } = payload.payload;
      handleSlideChange(presentationId, slideIndex);
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`✅ Subscribed to room:${roomId}`);
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [userId, roomId]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      imageContainerRef.current?.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      {currentPresentation ? (
        <main className="flex-grow flex flex-col">
          <div className="mb-2 text-center px-2">
            <h3 className="text-2xl sm:text-4xl font-bold truncate">
              {currentPresentation.title}
            </h3>
            <p className="text-sm sm:text-base mt-1 truncate">{currentPresentation.description}</p>
          </div>

          {currentImageUrl ? (
            <div
              ref={imageContainerRef}
              className="flex-grow relative flex justify-center items-center overflow-hidden rounded-lg "
            >
              <img
                src={currentImageUrl}
                alt={`Slide ${currentImageIndex + 1}`}
                draggable={false}
                className={`max-w-full max-h-full object-contain select-none transition-opacity duration-300 ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
              />

              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 bg-opacity-70 hover:bg-opacity-90 bg-red-400 px-3 py-1 rounded-md text-sm"
                aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
              >
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          ) : (
            <p className="text-center mt-auto">No images available.</p>
          )}
        </main>
      ) : (
        <p className="text-center mt-auto">Seems like nothing to show :)</p>
      )}
    </div>
  );
}
