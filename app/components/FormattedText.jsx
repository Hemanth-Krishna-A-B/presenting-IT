"use client";

import { BlockMath, InlineMath } from "react-katex";

export default function FormattedText({ content }) {
  if (!content) return null;

  // Regex to split by $$...$$ (block) and $...$ (inline), capturing them
  const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/g);

  return (
    <div className="space-y-1">
      {parts.map((part, index) => {
        // Block LaTeX ($$...$$)
        if (/^\$\$.*\$\$$/.test(part)) {
          const latex = part.slice(2, -2).trim();
          return (
            <div
              key={index}
              className="text-base sm:text-[0.95rem] overflow-x-auto"
            >
              <BlockMath math={latex} errorColor="#cc0000" />
            </div>
          );
        }

        // Inline LaTeX ($...$)
        if (/^\$.*\$$/.test(part)) {
          const latex = part.slice(1, -1).trim();
          return (
            <InlineMath
              key={index}
              math={latex}
              errorColor="#cc0000"
              className="inline text-sm sm:text-base"
            />
          );
        }

        // Plain text
        return (
          <p
            key={index}
            className="text-base whitespace-pre-wrap break-words overflow-x-auto"
          >
            {part}
          </p>
        );
      })}
    </div>
  );
}
