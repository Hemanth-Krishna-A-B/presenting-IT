"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function LatexTextEditor({ value, onChange }) {
  const [showMatrixPopup, setShowMatrixPopup] = useState(false);
  const [matrixRows, setMatrixRows] = useState(2);
  const [matrixCols, setMatrixCols] = useState(2);

  const insertAtCursor = (text) => {
    // Controlled component: simulate insertion by manipulating string
    const textarea = document.activeElement;
    if (!textarea || textarea.tagName !== "TEXTAREA") {
      // Fallback: append to end
      onChange(value + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.slice(0, start) + text + value.slice(end);
    onChange(newText);

    // Refocus & reposition cursor asynchronously
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const generateMatrixLatex = (rows, cols) => {
    const matrix = Array(rows)
      .fill()
      .map(() => Array(cols).fill("0"));
    const latex = `\\begin{bmatrix}${matrix
      .map((row) => row.join(" & "))
      .join(" \\\\ ")}\\end{bmatrix}`;
    insertAtCursor(`$$${latex}$$`);
    setShowMatrixPopup(false);
  };

  return (
    <div className="latex-editor border border-gray-300 rounded-md p-2">
      <div className="flex flex-wrap gap-1 mb-2">
        <button
          type="button"
          onClick={() => insertAtCursor("\\sqrt{}")}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          √
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("\\pi")}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          π
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("^{}")}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          x²
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("\\int_{a}^{b} f(x) \\,dx")}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ∫
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("\\sum_{i=1}^{n}")}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ∑
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("\\bar{f}")}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          f̅
        </button>
        <button
          type="button"
          onClick={() => setShowMatrixPopup(true)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Matrix
        </button>
      </div>

      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 font-mono resize-none"
        placeholder="Type normal text and LaTeX ($...$ or $$...$$) here..."
      />

      {showMatrixPopup && (
        <div className="absolute z-20 bg-white p-4 rounded shadow-md border mt-2">
          <h3 className="mb-2 font-semibold">Insert Matrix</h3>
          <div className="flex items-center gap-2 mb-2">
            <label>Rows:</label>
            <input
              type="number"
              min={1}
              value={matrixRows}
              onChange={(e) => setMatrixRows(Number(e.target.value))}
              className="w-16 border rounded p-1"
            />
            <label>Cols:</label>
            <input
              type="number"
              min={1}
              value={matrixCols}
              onChange={(e) => setMatrixCols(Number(e.target.value))}
              className="w-16 border rounded p-1"
            />
          </div>
          <button
            onClick={() => generateMatrixLatex(matrixRows, matrixCols)}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Insert
          </button>
          <button
            onClick={() => setShowMatrixPopup(false)}
            className="ml-2 bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded prose max-w-full overflow-x-auto">
        <ReactMarkdown
          children={value}
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        />
      </div>
    </div>
  );
}

export default function QuestionBank() {
  const [userId, setUserId] = useState(null);
  const [questionBankTitle, setQuestionBankTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading,setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

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

    // Send only question text, options, and correctAnswer — files are separate
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
    setLoading(true);
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
        setLoading(false);
      }
    } catch (error) {
      alert(`❌ Unexpected error: ${error.message}`);
    }finally{
      setLoading(false);
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
        <div key={i} className="border border-gray-300 p-4 rounded-xl space-y-4 relative">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Question {i + 1}</h3>
            <button
              onClick={() => removeQuestion(i)}
              className="text-sm text-red-500 hover:underline"
              type="button"
            >
              Remove
            </button>
          </div>

          {/* LaTeX Editor for Question */}
          <LatexTextEditor
            value={q.question}
            onChange={(val) => updateQuestion(i, "question", val)}
          />

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleQuestionImageUpload(i, e)}
            />
            {q.image && (
              <img
                src={q.image}
                alt={`Question ${i + 1} Image`}
                className="mt-2 max-h-40 rounded-lg"
              />
            )}
          </div>

          <div className="space-y-4">
            {q.options.map((opt, idx) => (
              <div key={idx}>
                <LatexTextEditor
                  value={opt}
                  onChange={(val) => updateQuestionOption(i, idx, val)}
                />
              </div>
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
        type="button"
      >
        ➕ Add New Question
      </button>

      <button
        onClick={handleSubmit}
        className="w-full bg-amber-600 text-white font-semibold py-3 rounded-lg hover:bg-amber-700"
        type="button"
      >
        { isLoading ? "Uploading..." : "Submit Question Bank"}
      </button>
    </div>
  );
}
