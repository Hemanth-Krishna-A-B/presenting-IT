"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import FormattedText from "@/app/components/FormattedText";

export default function QuestionPage() {
  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeout, setTimeoutVal] = useState(180);
  const [timeLeft, setTimeLeft] = useState(180);
  const [answered, setAnswered] = useState(false);
  const [answeredIndices, setAnsweredIndices] = useState(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const channelRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [bankId, setBankId] = useState(null);

  // Fetch questions from Supabase filtered by bankId
  async function fetchQuestions(bankId) {
    console.log("Fetching questions for bankId:", bankId);
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("bank_id", bankId);
    if (error) console.error("Error fetching questions:", error);
    return data;
  }

  // Submit total marks to backend API
  async function submitTotalMarks(regno, sessionid, bankId, totalScore) {
    console.log("submitTotalMarks called", { regno, sessionid, bankId, totalScore });
    try {
      const res = await fetch("/api/insertMark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regno, session_id: Number(sessionid), bank_id: Number(bankId), total_score: totalScore }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error submitting total marks:", data.error || data.message);
      } else {
        console.log("Total marks submitted:", data.message);
      }
    } catch (error) {
      console.error("Network error submitting total marks:", error);
    }
  }

  // Submit if not already submitted
  async function submitIfNotSubmitted() {
    if (submitted) {
      console.log("Already submitted, skipping submitIfNotSubmitted");
      return;
    }
    if (!sessionData) {
      console.log("No sessionData yet in submitIfNotSubmitted");
      return;
    }
    const student = JSON.parse(localStorage.getItem("STUDENT"));
    const regno = student?.regNo;
    console.log("student id is regno : " + regno);
    const sessionid = localStorage.getItem("SESSION-ID");

    if (regno && sessionid && bankId) {
      console.log("Submitting total marks via submitIfNotSubmitted");
      await submitTotalMarks(regno, sessionid, bankId, correctCount);
      setSubmitted(true);
    } else {
      console.log("Missing regno, sessionid, or bank_id; cannot submit");
    }
  }

  // Load session and initial data on mount
  useEffect(() => {
    async function loadInitial() {
      console.log("loadInitial called");

      const sessionId = localStorage.getItem("SESSION-ID");
      const room = localStorage.getItem("ROOM-ID");

      console.log("Loaded from localStorage:", { sessionId, room });

      setRoomId(room);

      if (!sessionId) {
        console.error("No SESSION-ID found in localStorage");
        return;
      }

      const { data: session, error } = await supabase
        .from("session")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        return;
      }

      console.log("Session data fetched:", session);

      setSessionData(session);
      setBankId(session.q_id);
      setTimeoutVal(session.timeout * 60);
      setTimeLeft(session.timeout * 60);

      const qs = await fetchQuestions(session.q_id);
      setQuestions(qs);
      setCorrectCount(0);
      setAnsweredIndices(new Set());
      setCurrentIndex(0);
      setAnswered(false);
      setSubmitted(false);
    }

    loadInitial();
  }, []);

  // Supabase Realtime subscription for question updates
  useEffect(() => {
    if (!roomId) {
      console.log("roomId is null or undefined, skipping subscription");
      return;
    }

    console.log("Subscribing to Supabase channel for roomId:", roomId);

    const channel = supabase.channel(`room:${roomId}`);

    channel.on("broadcast", { event: "item_shared" }, async ({ payload }) => {
      console.log("Broadcast received:", payload);

      if (payload.type === "questions") {
        console.log("New questions broadcast received with bank_id:", payload.id);
        await submitIfNotSubmitted();

        const newQs = await fetchQuestions(payload.id);
        setBankId(payload.id);
        setQuestions(newQs);
        setCurrentIndex(0);
        setTimeLeft(timeout);
        setAnswered(false);
        setAnsweredIndices(new Set());
        setCorrectCount(0);
        setSubmitted(false);
      }
    });

    channel.subscribe();

    channelRef.current = channel;

    return () => {
      console.log("Removing Supabase channel for roomId:", roomId);
      supabase.removeChannel(channel);
    };
  }, [roomId, timeout, sessionData, correctCount, submitted]);

  // Timer countdown effect
  useEffect(() => {
    if (!questions || answered || timeLeft === 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, answered, questions]);

  // When time runs out for current question
  useEffect(() => {
    if (!questions || answered) return;

    if (timeLeft === 0) {
      setAnswered(true);
      setAnsweredIndices((prev) => new Set(prev).add(currentIndex));
      submitIfNotSubmitted();
      console.log("Time out for question", currentIndex);
    }
  }, [timeLeft, answered, currentIndex, questions]);

  // Auto-submit total marks after all questions answered or last question timed out
  useEffect(() => {
    if (!questions || submitted || !sessionData) return;

    const allAnswered = answeredIndices.size === questions.length;
    const isLastQuestion = currentIndex === questions.length - 1;

    if (allAnswered || (timeLeft === 0 && isLastQuestion && answered)) {
      const sessionid = localStorage.getItem("SESSION-ID");

      if (sessionid) {
        console.log("Auto submitting total marks because all questions answered or last timed out");
        submitIfNotSubmitted();
        setSubmitted(true);
      }
    }
  }, [answeredIndices, correctCount, timeLeft, answered, currentIndex, questions, submitted, sessionData]);

  // Handle answer button click
  const handleAnswer = (opt) => {
    if (answered || timeLeft === 0) return;

    setAnswered(true);
    setAnsweredIndices((prev) => new Set(prev).add(currentIndex));

    const question = questions[currentIndex];
    const correctIndex = parseInt(question.correct, 10);
    const correctAnswer = question.option[correctIndex];

    if (opt === correctAnswer) {
      setCorrectCount((c) => c + 1);
      console.log("Correct answer:", opt);
    } else {
      console.log("Wrong answer:", opt, "Correct is:", correctAnswer);
    }
  };

  // Find the next unanswered question index
  const getNextUnansweredIndex = () => {
    let nextIndex = currentIndex + 1;
    while (nextIndex < questions.length && answeredIndices.has(nextIndex)) {
      nextIndex++;
    }
    return nextIndex;
  };

  // Next button handler to move to next unanswered question
  const next = () => {
    if (!questions) return;

    const nextIndex = getNextUnansweredIndex();

    if (nextIndex >= questions.length) {
      // No more unanswered questions ahead
      return;
    }

    setCurrentIndex(nextIndex);
    setTimeLeft(timeout);
    setAnswered(false);
  };

  if (!questions) return <p>Seems like nothing to show :)</p>;

  const allAnswered = answeredIndices.size === questions.length;

  // Show quiz complete screen if all answered or last question timeout answered
  if (allAnswered || (timeLeft === 0 && currentIndex === questions.length - 1 && answered)) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4 text-center">
        <h1 className="text-2xl font-bold">Quiz Completed!</h1>
        <p className="text-lg mt-4">
          You answered {correctCount} out of {questions.length} questions correctly.
        </p>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Questions</h1>
        <p className="text-red-600">Time Left: {timeLeft}s</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">


        <h2 className="text-lg font-semibold"><FormattedText content={q.title} /></h2>


        {q.image_url && (
          <img
            src={q.image_url}
            alt=""
            className="rounded max-h-60 object-contain"
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          {q.option.map((opt, i) => (
            <button
              key={i}
              disabled={answered || timeLeft === 0}
              onClick={() => handleAnswer(opt)}
              className="px-4 py-2 rounded border hover:bg-blue-100 disabled:opacity-50"
            >
              <FormattedText content={opt} />
            </button>
          ))}
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={next}
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            getNextUnansweredIndex() >= questions.length
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={getNextUnansweredIndex() >= questions.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}
