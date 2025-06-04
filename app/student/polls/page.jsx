"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PollPage() {
  const [polls, setPolls] = useState(null);
  const [timeout, setTimeoutVal] = useState(180);
  const [timeLeft, setTimeLeft] = useState(180);
  const [selected, setSelected] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Fetch a single poll
  async function fetchPoll(id) {
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Poll fetch error:", error);
      return null;
    }
    return data;
  }

  // Fetch vote statistics
  async function fetchPollStats(pollId, optionsCount, currentSessionId) {
    const { data, error } = await supabase
      .from("poll-response")
      .select("option")
      .eq("poll_id", pollId)
      .eq("session_id", currentSessionId);

    if (error) {
      console.error("Failed to fetch stats:", error);
      return;
    }

    const counts = Array(optionsCount).fill(0);
    data.forEach((r) => {
      if (r.option !== null && r.option < counts.length) {
        counts[r.option]++;
      }
    });

    setStats(counts);
  }

  // Initialization
  useEffect(() => {
    async function init() {
      const sessionId = localStorage.getItem("SESSION-ID");
      const student = JSON.parse(localStorage.getItem("STUDENT"));
      const room = localStorage.getItem("ROOM-ID");

      setSessionId(sessionId);
      setRoomId(room);

      const { data: session, error } = await supabase
        .from("session")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) return;

      setTimeoutVal(session.timeout * 60);
      setTimeLeft(session.timeout * 60);

      const pollData = await fetchPoll(session.p_id);
      if (pollData) {
        setPolls(pollData);
        await fetchPollStats(pollData.id, pollData.option.length, sessionId);
      }
    }

    init();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!polls || timeLeft === 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, polls]);

  // Real-time DB updates listener
  useEffect(() => {
    if (!polls || !sessionId) return;

    const channel = supabase
      .channel(`poll-response:${polls.id}`)
      .on(
        "postgres_changes",
        {
          event: "*", // catch INSERT + UPDATE
          schema: "public",
          table: "poll-response",
          filter: `poll_id=eq.${polls.id}`,
        },
        async () => {
          await fetchPollStats(polls.id, polls.option.length, sessionId);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [polls, sessionId]);

  // Handle vote
  const handleSelect = async (opt) => {
    if (timeLeft === 0) return;
    setSelected(opt);

    const student = JSON.parse(localStorage.getItem("STUDENT"));
    const sessionId = localStorage.getItem("SESSION-ID");
    const optionIndex = polls.option.findIndex((o) => o === opt);

    const { error } = await supabase.from("poll-response").upsert({
      regno: student.regNo,
      poll_id: polls.id,
      option: optionIndex,
      session_id: parseInt(sessionId),
    });

    if (error) {
      console.error("Failed to save poll response:", error.message);
    }
  };

  if (!polls) return <p>Hmm...looks like nothing  to show :(</p>;
  const poll = polls;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Poll</h1>
        <p className="text-red-600">Time Left: {timeLeft}s</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <h2 className="text-lg font-semibold">{poll.title}</h2>
        {poll.image_url && (
          <img src={poll.image_url} alt="" className="rounded max-h-60 object-contain" />
        )}
        <div className="grid grid-cols-2 gap-2">
          {poll.option.map((opt, i) => {
            const total = stats ? stats.reduce((a, b) => a + b, 0) : 0;
            const percent = stats && total > 0 ? Math.round((stats[i] / total) * 100) : 0;

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={timeLeft === 0}
                className={`px-4 py-2 rounded border flex justify-between items-center ${
                  selected === opt ? "bg-blue-200" : "hover:bg-blue-100"
                }`}
              >
                <span>{opt}</span>
                {stats && (
                  <span className="text-sm text-gray-600 ml-2">{percent}%</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
