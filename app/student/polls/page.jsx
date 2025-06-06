"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import "../../globals.css";
// Helper to parse text and render LaTeX blocks
const renderMixedText = (text) => {
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g); // Match both $$...$$ and $...$

  return parts.map((part, i) => {
    if (/^\$\$.*\$\$$/.test(part)) {
      const latex = part.slice(2, -2);
      return (
        <div key={i} className="text-base sm:text-[0.95rem] overflow-x-auto">
          <BlockMath>{latex}</BlockMath>
        </div>

      );
    } else if (/^\$.*\$/.test(part)) {
      const latex = part.slice(1, -1);
      return (
        <span key={i} className="text-sm sm:text-base overflow-x-auto inline-block">
          <InlineMath>{latex}</InlineMath>
        </span>

      );
    } else {
      return <span key={i}>{part}</span>;
    }
  });
};



export default function PollPage() {
  const [polls, setPolls] = useState(null);
  const [timeout, setTimeoutVal] = useState(180);
  const [timeLeft, setTimeLeft] = useState(180);
  const [selected, setSelected] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessionId, setSessionId] = useState(null);

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

  useEffect(() => {
  if (!roomId || !sessionId) return;

  const channel = supabase.channel(`room:${roomId}`, {
    config: {
      broadcast: {
        self: false,
      },
    },
  });

  channel
    .on("broadcast", { event: "item_shared" }, async ({ payload }) => {
      if (payload?.type === "polls" && payload?.id) {
        const newPoll = await fetchPoll(payload.id);
        if (newPoll) {
          setPolls(newPoll);
          setSelected(null);
          setTimeLeft(timeout); // optionally reset timer
          await fetchPollStats(newPoll.id, newPoll.option.length, sessionId);
        }
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [roomId, sessionId, timeout]);


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
      if (session.p_id == null) return
      const pollData = await fetchPoll(session.p_id);
      if (pollData) {
        setPolls(pollData);
        await fetchPollStats(pollData.id, pollData.option.length, sessionId);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!polls || timeLeft === 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, polls]);

  useEffect(() => {
    if (!polls || !sessionId) return;

    const channel = supabase
      .channel(`poll-response:${polls.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
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

  if (!polls) return <p>Hmm...looks like nothing to show :(</p>;
  const poll = polls;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <h1 className="text-xl font-bold">Poll</h1>
        <p className="text-red-600 text-sm sm:text-base">Time Left: {timeLeft}s</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
        <h2 className="text-lg font-semibold break-words overflow-x-auto max-w-full">
          {renderMixedText(poll.title)}
        </h2>


        {poll.image_url && (
          <div className="w-full flex justify-center">
            <img
              src={poll.image_url}
              alt=""
              className="rounded max-h-60 object-contain"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {poll.option.map((opt, i) => {
            const total = stats ? stats.reduce((a, b) => a + b, 0) : 0;
            const percent = stats && total > 0 ? Math.round((stats[i] / total) * 100) : 0;

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={timeLeft === 0}
                className={`px-4 py-2 rounded border flex justify-between items-center w-full text-left gap-2
                ${selected === opt ? "bg-blue-200" : "hover:bg-blue-100"}
              `}
              >
                <span className="flex-1 break-words">{renderMixedText(opt)}</span>
                {stats && (
                  <span className="text-sm text-gray-600">{percent}%</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}