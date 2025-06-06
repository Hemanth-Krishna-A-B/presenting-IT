"use client";

import React, { useEffect, useState } from "react";
import CircularAvatar from "./small/circularAvatar";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AvatarRow({ className = "" }) {
  const [avatarsData, setAvatarsData] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("USER");
    const storedSession = localStorage.getItem("SESSION");

    if (!storedUser || !storedSession) return;

    let user, session_id;

    try {
      user = JSON.parse(storedUser);
      session_id = JSON.parse(storedSession);
    } catch (e) {
      console.error("Error parsing localStorage:", e);
      return;
    }

    const room_id = user?.room_id;
    if (!room_id || !session_id) return;

    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("session_id", session_id);

      if (!error) {
        // Optionally: sort by rollno or created_at
        const sorted = data.sort((a, b) => a.rollno - b.rollno);
        setAvatarsData(sorted);
      } else {
        console.error("Failed to fetch attendance:", error);
      }
    };

    fetchAttendance();

    const channel = supabase
      .channel(`room:${room_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance", filter: `session_id=eq.${session_id}`, },
        () => {
          console.log("Realtime change in attendance, refetching...");
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={`flex flex-row gap-x-2 items-center min-w-max ${className}`}>
      {avatarsData.map(({ rollno, regno }) => (
        <CircularAvatar
          key={rollno}
          id={rollno}
          name={regno}
          className="flex-shrink-0"
          active={true}
        />
      ))}
    </div>
  );
}
