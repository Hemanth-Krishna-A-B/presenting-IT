"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

function Countdown({ time, onTimeout }) {
  const [seconds, setSeconds] = useState(time);

  useEffect(() => {
    if (seconds === 0) {
      onTimeout();
      return;
    }
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds, onTimeout]);

  return <p className="text-right text-sm text-red-500">Time left: {seconds}s</p>;
}

function Section({ data, type }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState("");

  const current = data[index];
  const isLast = index === data.length - 1;
  const isFirst = index === 0;

  const handleAnswer = (option) => {
    setSelected(option);
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  const handleNext = () => {
    if (!isLast) {
      setIndex(index + 1);
      setSelected(answers[index + 1] || "");
    } else {
      alert(`${type} submitted!`);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setIndex(index - 1);
      setSelected(answers[index - 1] || "");
    }
  };

  const handleTimeout = () => {
    if (!selected) handleAnswer("(no response)");
    handleNext();
  };

  if (!current) return <p>No {type.toLowerCase()}s available.</p>;

  return (
    <div className="space-y-6 bg-white shadow rounded-xl p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{type}</h2>
        <Countdown time={20} onTimeout={handleTimeout} />
      </div>

      {current.image_url && (
        <img
          src={current.image_url}
          alt="Visual"
          className="w-full h-auto max-h-[300px] object-cover rounded-lg"
        />
      )}

      <p className="text-lg text-gray-700 font-medium">{current.text}</p>

      <div className="grid gap-3">
        {current.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option)}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
              selected === option
                ? "bg-blue-600 text-white border-blue-700 shadow"
                : "bg-gray-100 text-gray-800 hover:bg-blue-50 border-gray-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        {type === "Poll" && !isFirst && (
          <button
            onClick={handlePrevious}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-xl"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`ml-auto py-2 px-6 rounded-xl font-bold text-white ${
            selected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default function Respond() {
  const [questions, setQuestions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessionData = useCallback(async () => {
    const sessionId = localStorage.getItem("SESSION");
    if (!sessionId) {
      alert("No SESSION in localStorage");
      setLoading(false);
      return;
    }

    // Fetch session row by id
    const { data: sessionData, error: sessionError } = await supabase
      .from("session")
      .select("p_id, q_id")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      setLoading(false);
      return;
    }

    // Fetch polls if p_id returned
    if (sessionData.p_id) {
      const { data: pollsData, error: pollsError } = await supabase
        .from("polls")
        .select("*")
        .eq("id", sessionData.p_id); // Adjust filter if multiple polls per p_id needed

      if (pollsError) console.error("Error fetching polls:", pollsError);
      else setPolls(pollsData || []);
    }

    // Fetch questions if q_id returned
    if (sessionData.q_id) {
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("bank_id", sessionData.q_id);

      if (questionsError) console.error("Error fetching questions:", questionsError);
      else setQuestions(questionsData || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessionData();

    const roomId = localStorage.getItem("ROOM-ID");
    if (!roomId) {
      console.warn("No ROOM-ID found in localStorage");
      return;
    }

    // Subscribe to realtime channel
    const channel = supabase.channel(roomId);

    channel.on(
      "broadcast",
      { event: "item-shared" },
      (payload) => {
        console.log("message received", payload);
      }
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Subscribed to channel:", roomId);
      }
    });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessionData]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col gap-10 items-center">
      {questions.length > 0 && <Section data={questions} type="Question" />}
      {polls.length > 0 && <Section data={polls} type="Poll" />}
      {questions.length === 0 && polls.length === 0 && <p>No questions or polls to display.</p>}
    </div>
  );
}
