"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User, BadgeCheck, BookOpen, KeyRound } from "lucide-react";

export default function StudentLogin() {
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    regNo: "",
    sessionCode: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const { name, studentId, regNo, sessionCode } = formData;

  if (!name || !studentId || !regNo || !sessionCode) {
    alert("Please fill in all fields.");
    return;
  }

  setLoading(true);

  // Get session info by sessionCode (parsed int)
  const { data: session, error: sessionError } = await supabase
    .from("session")
    .select("*")
    .eq("id", parseInt(sessionCode))
    .eq("active", true)
    .single();

  if (sessionError || !session) {
    console.error("Error fetching session:", sessionError);
    alert("Invalid or inactive session code.");
    setLoading(false);
    return;
  }

  // Get room_id for the teacher of this session
  const { data: userProfile, error: err2 } = await supabase
    .from("user_profiles")
    .select("room_id")
    .eq("uuid", session.teacher_id)
    .single();

  if (err2 || !userProfile?.room_id) {
    alert("Error fetching room ID.");
    setLoading(false);
    return;
  }

  const room_id = userProfile.room_id;

  console.log("Session data:", session);
  console.log("Room ID:", room_id);

  // Insert attendance record
  const { error: insertError } = await supabase.from("attendance").insert({
    session_id: session.id,
    name,
    rollno: studentId,
    regno: regNo,
  });

  if (insertError) {
    alert("Failed to log in. Try again.");
    setLoading(false);
    return;
  }

  // Save to localStorage
  localStorage.setItem("STUDENT", JSON.stringify({ name, studentId, regNo }));
  localStorage.setItem("SESSION-ID", session.id.toString());
  localStorage.setItem("ROOM-ID", room_id.toString());

  setLoading(false);
  router.push("/student/dashboard");
};

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-tr from-white to-gray-100">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-800 to-purple-900 text-white justify-center items-center p-8">
        <div className="max-w-lg text-center">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-md">
            Welcome to Student Portal
          </h1>
          <p className="text-lg mb-6 opacity-90 leading-relaxed">
            Access your live sessions, track your progress, and connect with instructors seamlessly.
            Join thousands of students already learning with us.
          </p>
          <ul className="list-disc pl-5 space-y-3 text-indigo-100 text-base max-w-md mx-auto text-left">
            <li>Real-time session updates</li>
            <li>Personalized study plans</li>
            <li>24/7 support from mentors</li>
          </ul>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/2 w-full flex justify-center items-center p-6 sm:p-10 bg-white/30 backdrop-blur-md">
        <div className="w-full max-w-md bg-white/60 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-white/30">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6 sm:mb-10">
            Student Login
          </h2>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition py-2.5 sm:py-3 text-gray-900 text-sm sm:text-md"
                />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700 mb-1">
                Student ID
              </label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="studentId"
                  placeholder="STU123456"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition py-2.5 sm:py-3 text-gray-900 text-sm sm:text-md"
                />
              </div>
            </div>

            {/* Reg No */}
            <div>
              <label htmlFor="regNo" className="block text-sm font-semibold text-gray-700 mb-1">
                Reg No
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="regNo"
                  placeholder="20CS123"
                  value={formData.regNo}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition py-2.5 sm:py-3 text-gray-900 text-sm sm:text-md"
                />
              </div>
            </div>

            {/* Session Code */}
            <div>
              <label htmlFor="sessionCode" className="block text-sm font-semibold text-gray-700 mb-1">
                Session Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="sessionCode"
                  placeholder="ABC123"
                  value={formData.sessionCode}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition py-2.5 sm:py-3 text-gray-900 text-sm sm:text-md"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white font-bold py-2.5 sm:py-3 rounded-full shadow-lg transition duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
