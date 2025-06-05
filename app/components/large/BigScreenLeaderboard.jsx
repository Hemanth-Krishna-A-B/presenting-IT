"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BigScreenLeaderboard() {
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
        .select("*") // select all fields including bank_id and time
        .eq("session_id", session_id)
        .limit(50);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setData([]);
      } else {
        // sort client-side by bank_id desc, total_score desc, time asc
        const sorted = (leaderboard || []).sort((a, b) => {
          if (b.bank_id !== a.bank_id) return b.bank_id - a.bank_id;
          if (b.total_score !== a.total_score) return b.total_score - a.total_score;
          return a.time - b.time; // smaller time is better
        });
        setData(sorted);
      }
      setLoading(false);
    };

    fetchLeaderboard();

    const channel = supabase
      .channel(`room:${user.room_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard", filter: `session_id=eq.${session_id}` },
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
        No leaderboard data.
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg max-h-[90vh] overflow-y-auto">
      <ul className="space-y-3">
        {data.map(({ regno, total_score, created_at, bank_id, time }, index) => (
          <li
            key={`${regno}-${bank_id}`} // unique key using regno + bank_id
            className={`flex justify-between items-start bg-gray-100 px-3 py-2 rounded-md ${
              index === 0 ? "bg-yellow-100 border border-yellow-400" : ""
            }`}
          >
            {/* Rank Badge and regno */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <span
                className={`text-white font-semibold text-xs px-2 py-1 rounded-full ${
                  index === 0
                    ? "bg-yellow-500"
                    : index === 1
                    ? "bg-gray-400"
                    : index === 2
                    ? "bg-yellow-700"
                    : "bg-blue-500"
                }`}
              >
                {index + 1}
              </span>
              <span className="font-medium text-sm">{regno.toUpperCase()}</span>
            </div>

            {/* Score and time in vertical stack */}
            <div className="text-right">
              <div className="text-sm font-semibold">{total_score.toFixed(2)} pts</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(created_at).toLocaleTimeString()}</div>
              <div className="text-xs text-gray-500 mt-1">Bank ID: {bank_id}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
