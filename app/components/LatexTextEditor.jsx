"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function LatexTextEditor({ value, onChange }) {
  const [showMatrixPopup, setShowMatrixPopup] = useState(false);
  const [matrixRows, setMatrixRows] = useState(2);
  const [matrixCols, setMatrixCols] = useState(2);
  const textareaRef = useRef(null);

  const insertAtCursor = (text, callback) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.slice(0, start) + text + value.slice(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
      if (callback) callback();
    }, 0);
  };

  const generateMatrixLatex = () => {
    const matrix = Array(matrixRows)
      .fill()
      .map(() => Array(matrixCols).fill("0"));

    const latex = `\\begin{bmatrix}${matrix
      .map((row) => row.join(" & "))
      .join(" \\\\ ")}\\end{bmatrix}`;

    insertAtCursor(`$$${latex}$$`, () => setShowMatrixPopup(false));
  };

  return (
    <div className="relative space-y-4 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "√", latex: "\\sqrt{}", tooltip: "Square root" },
          { label: "π", latex: "\\pi", tooltip: "Pi" },
          { label: "^", latex: "^{}", tooltip: "Power (x^n)" },
          { label: "∫", latex: "\\int_{a}^{b} f(x) \\,dx", tooltip: "Integral" },
          { label: "∑", latex: "\\sum_{i=1}^{n}", tooltip: "Summation" },
          { label: "f̅", latex: "\\bar{f}", tooltip: "Overline f" },
        ].map((btn, idx) => (
          <button
            key={idx}
            className="bg-gray-100 text-sm font-medium rounded-lg px-3 py-2 hover:bg-amber-100 transition border border-gray-300 shadow-sm"
            onClick={() => insertAtCursor(btn.latex)}
            title={btn.tooltip}
          >
            {btn.label}
          </button>
        ))}
        <button
          className="bg-blue-100 text-sm font-medium rounded-lg px-3 py-2 hover:bg-blue-200 transition border border-blue-300 shadow-sm"
          onClick={() => setShowMatrixPopup(true)}
          title="Insert Matrix"
        >
          ⌧ Matrix
        </button>
      </div>

      {/* Matrix Popup */}
      {showMatrixPopup && (
        <div className="absolute top-24 left-4 z-50 bg-white p-5 rounded-xl shadow-xl border border-gray-300 w-80">
          <h3 className="text-md font-semibold mb-3">Insert Matrix</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm">Rows</label>
            <input
              type="number"
              min={1}
              value={matrixRows}
              onChange={(e) => setMatrixRows(Number(e.target.value))}
              className="border rounded px-2 py-1 w-16"
            />
            <label className="text-sm">Cols</label>
            <input
              type="number"
              min={1}
              value={matrixCols}
              onChange={(e) => setMatrixCols(Number(e.target.value))}
              className="border rounded px-2 py-1 w-16"
            />
            <button
              className="ml-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={generateMatrixLatex}
            >
              Insert
            </button>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-36 border border-gray-300 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        placeholder="Type normal text and LaTeX here using $...$ or $$...$$"
      />

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 prose max-w-none">
        <ReactMarkdown
          children={value}
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        />
      </div>
    </div>
  );
}
