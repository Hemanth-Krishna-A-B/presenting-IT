// components/FormattedText.js
"use client";

import { BlockMath } from "react-katex";

export default function FormattedText({ content }) {
  if (!content) return null;

  // Split by $$ to extract LaTeX expressions
  const parts = content.split("$$");

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // Odd indices are LaTeX blocks
          return (
            <BlockMath key={index} math={part.trim()} errorColor="#cc0000" />
          );
        } else {
          // Even indices are plain text
          return (
            <p key={index} className="text-base whitespace-pre-wrap">
              {part}
            </p>
          );
        }
      })}
    </>
  );
}
