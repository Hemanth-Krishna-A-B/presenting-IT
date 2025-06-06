"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PollDonutChart from "./PollDonutChart";
import { supabase } from "@/lib/supabaseClient";
import "../../globals.css";

export default function PollDonutSlider() {
  const [current, setCurrent] = useState(0);
  const [polls, setPolls] = useState([]);
  const sliderRef = useRef(null);
  const subscriptionRef = useRef(null);
  const [user_id, setUser] = useState(null);
  const [session_id, setSessionId] = useState(null);
  const [room_id, setRoomId] = useState(null);
  const length = polls.length;

  const goToSlide = (index) => {
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    setCurrent(clampedIndex);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: clampedIndex * sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  async function fetchPollResponses(sessionId) {
    if (!sessionId) return;
    const { data, error } = await supabase
      .from("poll-response")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error fetching poll responses:", error);
      setPolls([]);
      return;
    }

    const grouped = data.reduce((acc, row) => {
      if (!acc[row.poll_id]) {
        acc[row.poll_id] = { subtitle: `Poll #${row.poll_id}`, data: [] };
      }
      acc[row.poll_id].data.push(String(row.option));
      return acc;
    }, {});

    const processed = Object.values(grouped).map((poll) => {
      const counts = {};
      poll.data.forEach((option) => {
        counts[option] = (counts[option] || 0) + 1;
      });
      return {
        subtitle: poll.subtitle,
        data: Object.entries(counts).map(([option, votes]) => ({
          option,
          votes,
        })),
      };
    });

    setPolls(processed);
    setCurrent(0);
  }

  useEffect(() => {
    const setup = async () => {
      const user = JSON.parse(localStorage.getItem("USER"));
      const roomId = user?.room_id;
      const sessionId = localStorage.getItem("SESSION");

      if (!roomId || !sessionId) {
        console.warn("Missing room_id or session_id");
        setPolls([]);
        return;
      }

      setUser(user);
      setRoomId(roomId);
      setSessionId(sessionId);

      await fetchPollResponses(sessionId);

      // Setup Realtime subscription
      try {
        const channel = supabase.channel(`room:${roomId}`, {
          config: { postgres_changes: { enabled: true } },
        });

        let debounceTimer;

        channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "poll-response",
            filter: `session_id=eq.${sessionId}`,
          },
          () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              fetchPollResponses(sessionId);
            }, 300);
          }
        );

        const { error, status } = await channel.subscribe();

        if (error) {
          console.error("Subscription error:", error);
        } else {
          console.log("Subscription status:", status);
        }

        subscriptionRef.current = channel;
      } catch (err) {
        console.error("Failed to setup realtime subscription:", err);
      }
    };

    setup();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
        console.log("Unsubscribed from realtime updates");
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sliderRef.current) return;
      const scrollLeft = sliderRef.current.scrollLeft;
      const width = sliderRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== current) setCurrent(newIndex);
    };
    const refCurrent = sliderRef.current;
    refCurrent?.addEventListener("scroll", handleScroll);
    return () => refCurrent?.removeEventListener("scroll", handleScroll);
  }, [current]);

  if (length === 0) {
    return (
      <div className="text-center p-4 text-gray-600">No polls to display</div>
    );
  }

  return (
    <div
      className="relative w-full rounded-md p-4 select-none text-black"
      style={{ minHeight: 320 }}
    >
      {/* Subtitle */}
      <div className="mb-4 text-lg font-semibold text-center">
        {polls[current]?.subtitle || "Poll Results"}
      </div>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="flex w-full overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {polls.map((poll, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0 snap-center flex flex-col items-center justify-center gap-2"
            style={{ scrollSnapAlign: "center" }}
          >
            <PollDonutChart pollData={poll.data} />
          </div>
        ))}
      </div>

      {/* Nav Buttons */}
      <button
        onClick={() => goToSlide(current - 1)}
        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/70"
        disabled={current === 0}
        aria-label="Previous"
        type="button"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => goToSlide(current + 1)}
        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/70"
        disabled={current === length - 1}
        aria-label="Next"
        type="button"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1 pointer-events-none select-none">
        {polls.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition ${
              current === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
