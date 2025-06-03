"use client";

import { useEffect, useState } from "react";

export default function PresentationViewer() {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchPresentation = async () => {
      const sessionId = localStorage.getItem("SESSION");
      const roomId = localStorage.getItem("ROOM-ID");

      if (!sessionId || !roomId) return;

      const { data, error } = await fetch(
        `/api/presentation?room_id=${roomId}`
      ).then((res) => res.json());

      if (error || !data || !data.image_url) {
        setImageUrl(null);
      } else {
        setImageUrl(data.image_url);
      }
    };

    fetchPresentation();

    const interval = setInterval(fetchPresentation, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 flex justify-center items-center min-h-[300px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Presentation Slide"
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
