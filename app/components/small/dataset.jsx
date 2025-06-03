"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

// LocalStorage helpers
function getUserData() {
  try {
    return JSON.parse(localStorage.getItem("USER")) || null;
  } catch {
    return null;
  }
}

function getRoomId() {
  return getUserData()?.room_id ?? null;
}

function getSessionId() {
  return localStorage.getItem("SESSION") ?? null;
}

export default function Dataset() {
  const [questionsList, setQuestionsList] = useState([]);
  const [pollsList, setPollsList] = useState([]);
  const [view, setView] = useState("questions");
  const [search, setSearch] = useState("");
  const [sharedItems, setSharedItems] = useState({});
  const [loading, setLoading] = useState(true);

  const channelRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error: err } = await supabase.auth.getUser();
        const user = data?.user;

        if (err || !user) {
          console.error("Auth error or user not found:", err?.message);
          return;
        }

        const res = await fetch("/api/getUserPollsAndQuestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacher_id: user.id }),
        });

        const result = await res.json();

        if (res.ok) {
          const normalizedPolls = (result.polls || []).map((poll) => ({
            ...poll,
            text: poll.title,
          }));

          const normalizedQuestions = (result.questionbank || []).map((q) => ({
            ...q,
            text: q["bank-title"],
          }));

          setPollsList(normalizedPolls);
          setQuestionsList(normalizedQuestions);
        } else {
          console.error("API error:", result);
        }
      } catch (err) {
        console.error("Fetching error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    try {
      const room_id = getRoomId();

      if (room_id) {
        const channel = supabase.channel(`room:${room_id}`);

        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(`Subscribed to Supabase channel: ${room_id}`);
          }
        });

        channelRef.current = channel;
      }
    } catch (error) {
      console.error("Error subscribing to channel:", error);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, []);

  const toggleShare = async (type, id) => {
    const session_id = getSessionId();
    const room_id = getRoomId();

    if (!session_id || !room_id) {
      console.warn("Cannot share: session or room_id missing.");
      return;
    }

    const alreadyShared = sharedItems[type]?.has(id);

    setSharedItems((prev) => {
      const currentSet = prev[type] || new Set();
      const newSet = new Set(currentSet);
      if (alreadyShared) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { ...prev, [type]: newSet };
    });

    if (!alreadyShared) {
      try {
        if (channelRef.current) {
          await channelRef.current.send({
            type: "broadcast",
            event: "item_shared",
            payload: { type, id },
          });
          console.log(`Broadcasted shared ${type} with id ${id} to channel ${room_id}`);
        }

        const response = await fetch("/api/updateSession", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id, type, item_id: id }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to update session:", data.error || data);
        } else {
          console.log("Session updated successfully");
        }
      } catch (error) {
        console.error("Error broadcasting or updating session:", error);
      }
    }
  };

  const toggleView = () => {
    setView((prev) => (prev === "questions" ? "polls" : "questions"));
    setSearch("");
  };

  const items = (view === "questions" ? questionsList : pollsList).filter((item) =>
    item.text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm max-w-full">
      {/* Header: Search + Toggle */}
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        {/* Search Input */}
        <input
          type="text"
          placeholder={`Search ${view}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow min-w-[120px] max-w-xs px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />

        {/* Toggle Switch */}
        <div
          role="switch"
          tabIndex={0}
          aria-checked={view === "polls"}
          onClick={toggleView}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") toggleView();
          }}
          className="inline-flex items-center cursor-pointer select-none space-x-2"
        >
          <span
            className={`font-semibold text-sm ${
              view === "questions" ? "text-amber-600" : "text-gray-400"
            }`}
          >
            Questions
          </span>

          <div className="relative w-10 h-5">
            <input
              type="checkbox"
              checked={view === "polls"}
              onChange={toggleView}
              className="sr-only"
            />
            <div className="w-full h-5 bg-gray-300 rounded-full shadow-inner" />
            <div
              className={`dot absolute top-0.5 left-0.5 w-4 h-4 bg-amber-600 rounded-full transition-transform ${
                view === "polls" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>

          <span
            className={`font-semibold text-sm ${
              view === "polls" ? "text-amber-600" : "text-gray-400"
            }`}
          >
            Polls
          </span>
        </div>
      </div>

      {/* Scrollable List */}
      <ul className="max-h-64 overflow-y-auto space-y-2">
        {loading ? (
          <li className="text-center text-gray-400 italic select-none">Loading...</li>
        ) : items.length === 0 ? (
          <li className="text-center text-gray-400 italic select-none">No {view} found.</li>
        ) : (
          items.map(({ id, text }) => {
            const isShared = sharedItems[view]?.has(id);
            return (
              <li
                key={id}
                className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition"
              >
                <span className="flex-grow truncate text-gray-900">{text}</span>
                <button
                  className={`ml-4 px-4 py-1 rounded-md text-sm font-semibold transition ${
                    isShared
                      ? "bg-amber-600 text-white hover:bg-amber-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => toggleShare(view, id)}
                  aria-pressed={isShared}
                >
                  {isShared ? "Shared" : "Share"}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
