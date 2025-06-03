"use client";
import { User, BadgeCheck, BookOpen, KeyRound } from "lucide-react"; // Icons

export default function StudentLoginL() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-tr from-sky-200 via-indigo-100 to-purple-200">
      {/* Left Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-indigo-800 to-purple-900 text-white flex flex-col justify-center p-12">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-md">
          Welcome to Student Portal
        </h1>
        <p className="text-lg max-w-lg mb-6 opacity-90 leading-relaxed">
          Access your live sessions, track your progress, and connect with instructors seamlessly.
          Join thousands of students already learning with us.
        </p>
        <ul className="list-disc pl-5 space-y-3 text-indigo-100 text-base max-w-md">
          <li>📡 Real-time session updates</li>
          <li>📘 Personalized study plans</li>
          <li>🧑‍🏫 24/7 support from mentors</li>
        </ul>
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/2 flex justify-center items-center p-10 bg-white/30 backdrop-blur-md">
        <div className="w-full max-w-md bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-10 border border-white/30">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
            Student Login
          </h2>

          <form className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition py-3 text-gray-900 text-md"
                />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID
              </label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="studentId"
                  placeholder="STU123456"
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition py-3 text-gray-900 text-md"
                />
              </div>
            </div>

            {/* RegNo */}
            <div>
              <label htmlFor="regNo" className="block text-sm font-semibold text-gray-700 mb-2">
                Reg No
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="regNo"
                  placeholder="20CS123"
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition py-3 text-gray-900 text-md"
                />
              </div>
            </div>

            {/* Session Code */}
            <div>
              <label htmlFor="sessionCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Session Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="sessionCode"
                  placeholder="ABC123"
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition py-3 text-gray-900 text-md"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white font-bold py-3 rounded-full shadow-lg transition duration-300 transform hover:scale-105 active:scale-95"
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
