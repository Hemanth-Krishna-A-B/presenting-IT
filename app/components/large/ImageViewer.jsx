"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ImageViewer() {
  const [slideData, setSlideData] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [channelReady, setChannelReady] = useState(false); // NEW: track channel subscription readiness

  const sliderRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Failed to get user:", error);
        return;
      }

      const localUser = localStorage.getItem("USER");

      if (!localUser) {
        console.warn("USER not found in localStorage");
        return;
      }

      const parsed = JSON.parse(localUser);
      if (!parsed.room_id) {
        console.warn("room_id missing in localStorage USER");
        return;
      }

      // ✅ Now both are available and safe to use
      setUserId(user.id);
      setRoomId(parsed.room_id);
    };

    // Wait a tick to allow hydration/localStorage readiness
    setTimeout(getUser, 100); // Optional: adjust delay if needed
  }, []);


  // Join Realtime Presence channel
  useEffect(() => {
    if (!roomId || !userId) {
      return;
    }
    console.log(roomId);
    const ch = supabase.channel(`room:${roomId}`);
    const data = `room:${roomId}`;
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ im Subscribed to: ", data);
        setChannelReady(true); // mark channel ready here
      }
    });

    channelRef.current = ch;
    setChannelReady(true);

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setChannelReady(false); // reset on cleanup
    };
  }, [roomId, userId]);

  // Listen for incoming slide changes broadcast
  useEffect(() => {
    if (!channelRef.current) return;

    const listener = channelRef.current.on(
      "broadcast",
      { event: "slide-changed" },
      (payload) => {
        if (payload.presentationId !== currentSet) {
          setCurrentSet(payload.presentationId);
        }
        setCurrentIndex(payload.slideIndex);
      }
    );

    return () => {
    };
  }, [currentSet]);

  // Fetch teacher's presentations
  useEffect(() => {
    if (!userId) return;

    const fetchPresentations = async () => {
      const { data, error } = await supabase
        .from("presentation")
        .select("id, title, image_url")
        .eq("teacher_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading presentations:", error);
      } else {
        setSlideData(data);
      }
    };

    fetchPresentations();
  }, [userId]);

  const images =
    currentSet !== null
      ? slideData.find((s) => s.id === currentSet)?.image_url || []
      : [];

  const goToSlide = async (index) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    setCurrentIndex(clamped);

    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: clamped * sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }

    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "slide-changed",
        payload: {
          presentationId: currentSet,
          slideIndex: clamped,
        },
      });
      console.log(`Broadcasted slide-changed with id ${currentSet} to channel ${roomId}`);
    }
  };


  useEffect(() => {
    if (currentSet !== null) {
      goToSlide(0);
    }
  }, [currentSet]);

  const updatePresentation = async (presentation_id) => {
    if (!channelReady) {
      console.warn("Channel not ready yet, cannot update presentation");
      return;
    }


    const session_id = localStorage.getItem("SESSION");
    if (!session_id || !presentation_id) return;

    const res = await fetch("/api/updatePresentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, presentation_id }),
    });

    const result = await res.json();

    if (result.success) {
      console.log("✅ Session updated");
      setCurrentSet(presentation_id);
      setCurrentIndex(0);

      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "slide-changed",
          payload: {
            presentationId: presentation_id,
            slideIndex: 0,
          },
        });
        console.log(`Broadcasted slide-changed with id ${presentation_id} to channel ${roomId}`);
      }
    } else {
      console.error("❌ Update failed:", result.error);
    }
  };

  // Show loading if channel is not ready yet and userId/roomId exist (means still connecting)
  if (!channelReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Connecting to room...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">Your Presentations</h2>
        {currentSet !== null && (
          <button
            onClick={() => {
              setCurrentSet(null);
              setCurrentIndex(0);
            }}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {currentSet === null ? (
        <div className="p-4 space-y-4 overflow-y-auto">
          {slideData.length === 0 ? (
            <p className="text-gray-500 text-center">No presentations found.</p>
          ) : (
            slideData.map((set) => (
              <div
                key={set.id}
                onClick={() => updatePresentation(set.id)}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition ${!channelReady ? "opacity-50 pointer-events-none" : ""
                  }`}
              >
                <img
                  src={
                    Array.isArray(set.image_url) && set.image_url[0]
                      ? set.image_url[0]
                      : "/placeholder.png"
                  }
                  alt={set.title}
                  className="w-24 h-16 object-cover rounded-md shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{set.title}</h3>
                  <p className="text-sm text-gray-500">
                    {Array.isArray(set.image_url)
                      ? `${set.image_url.length} images`
                      : "No images"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={sliderRef}
            className="flex w-full h-full overflow-hidden scroll-smooth snap-x snap-mandatory"
          >
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Slide ${i}`}
                className="w-full h-full object-cover flex-shrink-0 snap-center"
              />
            ))}
          </div>

          <button
            onClick={() => goToSlide(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => goToSlide(currentIndex + 1)}
            disabled={currentIndex === images.length - 1}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${idx === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
