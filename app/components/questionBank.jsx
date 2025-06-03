"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
export default function QuestionBank() {
  

  const [userId, setUserId] = useState(null);
  const [questionBankTitle, setQuestionBankTitle] = useState("");
  const [questions, setQuestions] = useState([]);

  
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      
    };
    fetchUser();
  }, [supabase]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        image: null,
        file: null, 
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const updateQuestionOption = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = value;
      return updated;
    });
  };

  const handleQuestionImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setQuestions((prev) => {
        const updated = [...prev];
        updated[index].image = URL.createObjectURL(file);
        updated[index].file = file;
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("You must be logged in to submit a question bank.");
      return;
    }

    if (!questionBankTitle.trim()) {
      alert("Please enter a question bank title.");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("title", questionBankTitle);
    formData.append("teacher_id", userId);

    const questionsForJson = questions.map(({ question, options, correctAnswer }) => ({
      question,
      options,
      correctAnswer,
    }));

    formData.append("questions", JSON.stringify(questionsForJson));

    questions.forEach((q, i) => {
      if (q.file) {
        formData.append(`image-${i}`, q.file);
      }
    });

    try {
      const res = await fetch("/api/submit-question-bank", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ Question Bank created successfully!");
        setQuestionBankTitle("");
        setQuestions([]);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Unexpected error: ${error.message}`);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 text-black max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-center mb-6">❓ Create a Question Bank</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Question Bank Title</label>
        <input
          type="text"
          value={questionBankTitle}
          onChange={(e) => setQuestionBankTitle(e.target.value)}
          placeholder="e.g. JavaScript Basics"
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {questions.map((q, i) => (
        <div key={i} className="border border-gray-300 p-4 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Question {i + 1}</h3>
            <button onClick={() => removeQuestion(i)} className="text-sm text-red-500 hover:underline">
              Remove
            </button>
          </div>

          <textarea
            rows={3}
            placeholder="Enter question..."
            value={q.question}
            onChange={(e) => updateQuestion(i, "question", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 resize-none"
          />

          <div>
            <input type="file" accept="image/*" onChange={(e) => handleQuestionImageUpload(i, e)} />
            {q.image && <img src={q.image} alt={`Question ${i + 1} Image`} className="mt-2 max-h-40 rounded-lg" />}
          </div>

          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => updateQuestionOption(i, idx, e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correct Answer</label>
            <select
              value={q.correctAnswer}
              onChange={(e) => updateQuestion(i, "correctAnswer", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Select Correct Option</option>
              {q.options.map((_, idx) => (
                <option key={idx} value={idx}>
                  Option {idx + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="w-full bg-amber-400 text-white font-semibold py-2 rounded-lg hover:bg-amber-500"
      >
        ➕ Add New Question
      </button>

      <button
        onClick={handleSubmit}
        className="w-full bg-amber-600 text-white font-semibold py-3 rounded-lg hover:bg-amber-700"
      >
        Submit Question Bank
      </button>
    </div>
  );
}
