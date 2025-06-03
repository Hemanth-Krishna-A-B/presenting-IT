"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ImageSlider() {
  const [slideSets, setSlideSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSlideList, setShowSlideList] = useState(false);
  const [userId, setUserId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [channel, setChannel] = useState(null);

  const sliderRef = useRef(null);

  // Get user and room info from Supabase Auth
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setRoomId(user.user_metadata?.room_id || null);
      }
    };
    getUser();
  }, []);

  // Subscribe to Realtime Presence channel
  useEffect(() => {
    if (!roomId || !userId) return;

    const ch = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: userId } },
    });

    ch.on("presence", { event: "sync" }, () => {
      // Here you can get presence state if needed
    });

    // Listen to presence 'track' updates from others
    ch.on("presence", { event: "track" }, (payload) => {
      if (payload.presence && payload.presence.length > 0) {
        // Payload presence contains an array of presence states for this key
        // We take the last presence update
        const presenceData = payload.presence[payload.presence.length - 1].payload;

        if (presenceData) {
          const { presentationId, slideIndex } = presenceData;

          if (
            presentationId !== currentSet &&
            slideIndex !== currentIndex &&
            presentationId !== null
          ) {
            setCurrentSet(presentationId);
            setCurrentIndex(slideIndex);
          } else if (presentationId === currentSet && slideIndex !== currentIndex) {
            setCurrentIndex(slideIndex);
          }
        }
      }
    });

    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Subscribed to room:", `room:${roomId}`);
      }
    });

    setChannel(ch);

    return () => {
      supabase.removeChannel(ch);
      setChannel(null);
    };
  }, [roomId, userId, currentSet, currentIndex]);

  // Fetch slide sets (presentations) from Supabase for the teacher (user)
  useEffect(() => {
    if (!userId) return;

    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from("presentation")
        .select("id, title, image_url")
        .eq("teacher_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading presentations:", error);
      } else {
        setSlideSets(data || []);
      }
    };

    fetchSlides();
  }, [userId]);

  // Update images when currentSet changes
  useEffect(() => {
    if (currentSet === null) {
      setImages([]);
      setCurrentIndex(0);
      return;
    }

    const foundSet = slideSets.find((set) => set.id === currentSet);
    if (foundSet && Array.isArray(foundSet.image_url)) {
      setImages(foundSet.image_url);
    } else {
      setImages([]);
    }
    setCurrentIndex(0);
  }, [currentSet, slideSets]);

  // Scroll slider when currentIndex changes
  useEffect(() => {
    if (sliderRef.current && currentSet !== null) {
      sliderRef.current.scrollTo({
        left: currentIndex * sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex, currentSet]);

  // Navigate to a slide index and broadcast to channel
  const goToSlide = (index) => {
    if (!images.length) return;
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    setCurrentIndex(clamped);

    // Broadcast slide change via presence track
    channel?.track({
      presentationId: currentSet,
      slideIndex: clamped,
    });
  };

  // Select a slide set and notify backend (optionally)
  const openSlideSet = async (id) => {
    // Example: Call your API to update session if needed
    const session_id = localStorage.getItem("SESSION");
    if (session_id) {
      try {
        const res = await fetch("/api/updatePresentation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id, presentation_id: id }),
        });
        const result = await res.json();
        if (!result.success) {
          console.error("Failed to update session:", result.error);
        }
      } catch (err) {
        console.error("API error updating session:", err);
      }
    }

    setCurrentSet(id);
    setShowSlideList(false);

    // Broadcast first slide index
    channel?.track({
      presentationId: id,
      slideIndex: 0,
    });
  };

  const closeSlider = () => {
    setCurrentSet(null);
    setCurrentIndex(0);

    // Optionally broadcast closing slide
    channel?.track({
      presentationId: null,
      slideIndex: 0,
    });
  };

  return (
    <div className="w-full h-64 sm:h-40 bg-white rounded-lg shadow-md overflow-hidden flex flex-col select-none relative">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        {!currentSet && (
          <div className="relative">
            <button
              onClick={() => setShowSlideList((v) => !v)}
              className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Open Slides
            </button>

            {showSlideList && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg rounded-md overflow-hidden z-40">
                {slideSets.length === 0 && (
                  <p className="p-4 text-center text-gray-500">No presentations found.</p>
                )}
                {slideSets.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => openSlideSet(set.id)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                    type="button"
                  >
                    {set.title}
                  </button>
                ))}
                <button
                  onClick={() => setShowSlideList(false)}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 transition"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {currentSet !== null && (
          <button
            onClick={closeSlider}
            className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            aria-label="Close slider"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {currentSet !== null && images.length > 0 && (
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={sliderRef}
            className="flex h-full overflow-x-scroll scroll-smooth snap-x snap-mandatory"
          >
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Slide ${idx + 1}`}
                className="w-full h-full flex-shrink-0 object-cover snap-center select-none"
                draggable={false}
              />
            ))}
          </div>

          {/* Prev Button */}
          <button
            onClick={() => goToSlide(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            aria-label="Previous slide"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Button */}
          <button
            onClick={() => goToSlide(currentIndex + 1)}
            disabled={currentIndex === images.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            aria-label="Next slide"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx === currentIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {currentSet !== null && images.length === 0 && (
        <div className="flex items-center justify-center flex-grow text-gray-500">
          No images found in this slide set.
        </div>
      )}
    </div>
  );
}
