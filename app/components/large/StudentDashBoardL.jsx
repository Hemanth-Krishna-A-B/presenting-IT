"use client";

import { useState } from "react";

export default function StudentDashboardL() {
  const [currentType, setCurrentType] = useState("question");
  const [selectedOption, setSelectedOption] = useState("");

  const presentationImage =
    "https://via.placeholder.com/800x400?text=Presentation+Slide"; // Replace with dynamic source or null if unavailable

  const mockData = [
    {
      type: "question",
      image: "https://via.placeholder.com/600x300?text=Question+Image",
      text: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
    },
    {
      type: "poll",
      image: "https://via.placeholder.com/600x300?text=Poll+Image",
      text: "What's your favorite programming language?",
      options: ["JavaScript", "Python", "Java", "Go"],
    },
  ];

  const current = mockData.find((item) => item.type === currentType) || {
    image: "",
    text: "",
    options: [],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-12 text-black">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Presentation Viewer */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-4 sm:p-6 text-center">
          {presentationImage ? (
            <img
              src={presentationImage}
              alt="Presentation Slide"
              className="w-full max-h-[400px] object-contain rounded-xl"
            />
          ) : (
            <div className="text-gray-500 text-lg font-medium py-12">
              No Presentation Available
            </div>
          )}
        </div>

        {/* Question/Poll Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* Toggle Buttons */}
          <div className="flex justify-center gap-4">
            {["question", "poll"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setCurrentType(type);
                  setSelectedOption("");
                }}
                className={`px-6 py-2 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 ${
                  currentType === type
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Text */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {currentType === "question" ? "Question" : "Poll"}
            </h2>
            <p className="text-base sm:text-lg text-gray-600">{current.text}</p>
          </div>

          {/* Options */}
          <div className="grid gap-4">
            {Array.isArray(current.options) &&
              current.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-4 rounded-lg border text-base sm:text-lg font-medium transition-all duration-300 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-700 shadow-md"
                        : "bg-gray-100 text-gray-800 hover:bg-blue-50 border-gray-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
