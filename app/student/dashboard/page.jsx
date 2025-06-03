"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PresentationViewer() {
  const [images, setImages] = useState([]); // array of slide image URLs
  const [currentSet, setCurrentSet] = useState(null); // current presentationId
  const [currentIndex, setCurrentIndex] = useState(0); // current slide index
  const [channel, setChannel] = useState(null);

  const roomId = typeof window !== "undefined" ? localStorage.getItem("ROOM-ID") : null;
  const studentData = typeof window !== "undefined" ? localStorage.getItem("STUDENT") : null;
  
  let userId = null;
  if (studentData) {
    try {
      userId = JSON.parse(studentData).regNo;
    } catch {
      userId = null;
    }
  }

  // Fetch images for a given presentation ID
  const fetchPresentationImages = async (presentationId) => {
    if (!presentationId) {
      setImages([]);
      return;
    }
    const { data, error } = await supabase
      .from("presentation")
      .select("image_url")
      .eq("id", presentationId)
      .single();

    if (error) {
      console.error("Error fetching presentation images:", error);
      setImages([]);
    } else {
      // Expecting image_url is an array of URLs
      setImages(data?.image_url || []);
    }
  };

  // Effect to subscribe to presence channel and handle presence updates
  useEffect(() => {
    if (!roomId || !userId) return;

    const ch = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: userId } },
    });

    // Listen for presence sync event if needed
    ch.on("presence", { event: "sync" }, () => {
      // Could get the whole presence state here if needed
    });

    // Listen for presence track event (when users update their presence data)
    ch.on("presence", { event: "track" }, (payload) => {
      if (payload.presence && payload.presence.length > 0) {
        const presenceData = payload.presence[payload.presence.length - 1].payload;

        if (presenceData) {
          const { presentationId, slideIndex } = presenceData;

          if (
            presentationId !== currentSet ||
            slideIndex !== currentIndex
          ) {
            setCurrentSet(presentationId);
            setCurrentIndex(slideIndex);
          }
        }
      }
    });

    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Subscribed to room:", `room:${roomId}`);

        // Track presence with empty or initial data to join presence
        ch.track({
          key: userId,
          user: { regno: userId, presentationId: null, slideIndex: 0 },
        });
      }
    });

    setChannel(ch);

    return () => {
      supabase.removeChannel(ch);
      setChannel(null);
    };
  }, [roomId, userId, currentSet, currentIndex]);

  // When currentSet changes, fetch images for that presentation
  useEffect(() => {
    if (currentSet) {
      fetchPresentationImages(currentSet);
    } else {
      setImages([]);
    }
  }, [currentSet]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 flex justify-center items-center min-h-[300px]">
        {images.length > 0 && images[currentIndex] ? (
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="max-w-full max-h-[70vh] rounded-xl object-contain"
          />
        ) : (
          <div className="text-gray-500 text-xl font-medium">
            Nothing Shared Yet
          </div>
        )}
      </div>
    </div>
  );
}
