"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LeaderboardList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("USER"));
    const session_id = JSON.parse(localStorage.getItem("SESSION"));

    if (!user?.room_id || !session_id) {
      console.warn("Missing user room_id or session_id in localStorage");
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data: leaderboard, error } = await supabase
        .from("leaderboard")
        .select("*")
        .eq("session_id", session_id)
        .order("total_score", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setData([]);
      } else {
        setData(
          leaderboard.map((item) => ({
            roll: item.regno.toUpperCase(),
            marks: item.total_score.toFixed(2),
            time: new Date(item.created_at).toLocaleTimeString(),
          }))
        );
      }
      setLoading(false);
    };

    fetchLeaderboard();

    const channel = supabase
      .channel(`room:${user.room_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard",
          filter: `session_id=eq.${session_id}`,
        },
        (payload) => {
          console.log("Realtime leaderboard change:", payload);
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full p-4 bg-white text-center text-gray-500 rounded-md">
        Loading leaderboard...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full p-4 bg-white text-center text-gray-500 rounded-md">
        No data available.
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-md shadow p-4 max-h-96 overflow-y-auto relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">🏆 Leaderboard</h2>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-3 text-sm font-medium text-gray-500 border-b pb-2">
        <div>Roll Number</div>
        <div className="text-center">Marks</div>
        <div className="text-right">Time</div>
      </div>

      {/* List */}
      <div className="divide-y mt-2">
        {data.map((student, index) => (
          <div
            key={student.roll}
            className={`grid grid-cols-3 py-2 text-gray-700 text-sm ${
              index === 0 ? "font-bold text-blue-700" : ""
            }`}
          >
            <div>{student.roll}</div>
            <div className="text-center">{student.marks}</div>
            <div className="text-right">{student.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
