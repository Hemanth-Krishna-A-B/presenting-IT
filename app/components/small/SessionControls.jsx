"use client";

import { useState, useEffect } from "react";
import { Download, Timer, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function SessionControls() {
  const [timerValue, setTimerValue] = useState(3);
  const [leaderboardVisibility, setLeaderboardVisibility] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState(null); // ✅ NEW

  // Load local session state
  useEffect(() => {
    const id = localStorage.getItem("SESSION");
    if (id) setSessionId(Number(id));

    const savedTimer = localStorage.getItem("timerValue");
    setTimerValue(savedTimer ? Number(savedTimer) : 3);

    const savedLeaderboard = localStorage.getItem("leaderboardVisibility");
    setLeaderboardVisibility(savedLeaderboard === "true");

    const user = JSON.parse(localStorage.getItem("USER"));
    if (user) {
      const ch = supabase.channel(`room:${user.id}`, {
        config: {
          broadcast: { self: false },
        },
      });

      ch.subscribe();
      setChannel(ch);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("timerValue", timerValue);
  }, [timerValue]);

  useEffect(() => {
    localStorage.setItem("leaderboardVisibility", leaderboardVisibility);
  }, [leaderboardVisibility]);

  const fetchStudentCount = async () => {
    if (!sessionId) return;

    const { count, error } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error fetching student count:", error);
      return;
    }

    setStudentCount(count || 0);
  };

  // Listen for attendance updates
  useEffect(() => {
    if (!sessionId) return;

    fetchStudentCount();

    const user = JSON.parse(localStorage.getItem("USER"));
    if (!user) return;

    const ch = supabase.channel(`room:${user.id}`);
    ch.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "attendance",
        filter: `session_id=eq.${sessionId}`,
      },
      () => fetchStudentCount()
    );

    ch.subscribe();

    return () => {
      ch.unsubscribe();
    };
  }, [sessionId]);

  const handleExport = async () => {
    if (!sessionId) return alert("No session ID found");

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      console.error("Export failed:", error);
      alert("Export failed!");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["RegNo,RollNo,Created At"]
        .concat(data.map((row) => `${row.regno},${row.rollno},${row.created_at}`))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function updateSessionSetting(sessionId, type, value) {
    try {
      const res = await fetch("/api/setSettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, type, value }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Unknown error");
      }
      return true;
    } catch (error) {
      console.error("Failed to update session setting:", error.message);
      alert(`Failed to update ${type}: ${error.message}`);
      return false;
    }
  }

  const handleSubmitTimer = async () => {
    if (!sessionId) return alert("No session ID found");

    const success = await updateSessionSetting(sessionId, "timer", timerValue);
    if (success) {
      alert(`Timer set to ${timerValue} minutes`);
      // ✅ Broadcast timer update
      channel?.send({
        type: "broadcast",
        event: "timer_update",
        payload: { timer: timerValue },
      });
    }
  };

  const handleToggleLeaderboard = async () => {
    if (!sessionId) return alert("No session ID found");

    const newVisibility = !leaderboardVisibility;
    setLeaderboardVisibility(newVisibility);

    const success = await updateSessionSetting(sessionId, "leaderboard", newVisibility);

    if (!success) {
      setLeaderboardVisibility(!newVisibility);
    } else {
      alert(`Leaderboard visibility set to ${newVisibility ? "ON" : "OFF"}`);
      // ✅ Broadcast leaderboard visibility update
      channel?.send({
        type: "broadcast",
        event: "leaderboard_toggle",
        payload: { visible: newVisibility },
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full p-4 bg-white text-center text-gray-500 rounded-md">
        Loading session controls...
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg max-h-[90vh] overflow-y-auto bg-white shadow-md p-4 flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-center text-gray-800">🛠️ Session Settings</h2>

      <button
        onClick={handleExport}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
      >
        <Download className="w-5 h-5" />
        Export Attendance
      </button>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
          <Timer className="w-5 h-5" />
          Timer: <span className="ml-1 font-semibold">{timerValue} min</span>
        </label>
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          value={timerValue}
          onChange={(e) => setTimerValue(Number(e.target.value))}
          className="w-full h-2 bg-gray-300 rounded-lg cursor-pointer accent-blue-600"
        />
        <button
          onClick={handleSubmitTimer}
          className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold"
        >
          Submit Timer
        </button>
      </div>

      <div className="flex justify-center items-center gap-3 text-gray-700 font-semibold text-sm">
        <Users className="w-5 h-5" />
        Students: <span>{studentCount}</span>
      </div>

      <div className="flex justify-center mb-20">
        <button
          onClick={handleToggleLeaderboard}
          className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold"
        >
          Leaderboard Visibility:{" "}
          <span className="inline-block w-8 text-center">
            {leaderboardVisibility ? "ON" : "OFF"}
          </span>
        </button>
      </div>
    </div>
  );
}
