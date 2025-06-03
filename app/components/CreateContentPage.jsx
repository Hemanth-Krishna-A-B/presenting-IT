"use client";
import { useState } from "react";
import Polls from "./polls";
import QuestionBank from "./questionBank";
import Presentations from "./presentations";

export default function CreateContentPage() {
    const [activeTab, setActiveTab] = useState("polls");

    const tabs = [
        { id: "polls", label: "Polls" },
        { id: "question", label: "Question" },
        { id: "presentations", label: "Presentations" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "polls":
                return (
                    <Polls />
                );
            case "question":
                return (
                    <QuestionBank/>
                );
            case "presentations":
                return (
                    <Presentations/>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 text-black">
            <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden">
                <div className="flex overflow-x-auto no-scrollbar border-b text-black">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 whitespace-nowrap py-3 px-4 sm:px-6 text-base sm:text-lg font-medium capitalize transition-all duration-300 border-b-2 sm:border-b-4 ${
                                activeTab === tab.id
                                    ? "border-amber-500 text-amber-600"
                                    : "border-transparent text-gray-600 hover:text-amber-600"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 sm:p-8">{renderContent()}</div>
            </div>
        </div>
    );
}
