"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LeaderboardPanel() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const sessionId = localStorage.getItem("SESSION-ID");
    const roomId = localStorage.getItem("ROOM-ID");

    async function fetchLeaderboard() {
      const { data: d1, error: er1 } = await supabase
        .from("session")
        .select("leaderboard")
        .eq("id", sessionId)
        .single();

      if (er1) {
        console.error("Error fetching session leaderboard flag:", er1);
        return;
      }

      if (!d1.leaderboard) {
        return;
      }

      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .eq("session_id", sessionId);

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else {
        // Sort by descending bank_id, then descending total_score, then ascending time
        const sorted = (data || []).sort((a, b) => {
          if (b.bank_id !== a.bank_id) return b.bank_id - a.bank_id;
          if (b.total_score !== a.total_score) return b.total_score - a.total_score;
          return a.time - b.time; // smaller time is better
        });
        setLeaderboard(sorted);
      }
    }

    fetchLeaderboard();

    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("Realtime leaderboard update:", payload);
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      <h2 className="text-2xl font-bold mb-6 text-center">🏆 Leaderboard</h2>

      <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Bank ID</th>
              <th className="px-4 py-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {leaderboard.map((user, index) => (
              <tr
                key={`${user.regno}-${user.bank_id}`}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">#{index + 1}</td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center p-3 text-black font-bold text-sm shadow
                      ${
                        index === 0
                          ? "bg-amber-400 text-white"
                          : index === 1
                          ? "bg-slate-300 text-black"
                          : index === 2
                          ? "bg-yellow-700 text-white"
                          : "bg-white"
                      }
                    `}
                  >
                    {user.regno.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">{user.total_score}</td>
                <td className="px-4 py-3 font-semibold">{user.bank_id}</td>
                <td className="px-4 py-3 font-semibold">{user.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
