"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-transparent">
        <h1 className="text-2xl md:text-3xl font-bold">Present_it</h1>
        <div className="space-x-4">
          <Link href="/adminlogin">
            <button className="px-4 py-2 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-gray-100 transition">
              Login
            </button>
          </Link>
          <Link href="/adminlogin">
            <button className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col justify-center items-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Streamline Your <span className="text-yellow-300">Attendance</span> &
          Engagement
        </h2>
        <p className="text-lg md:text-xl mb-10 max-w-2xl">
          Present_it helps teachers and students collaborate in real-time with interactive tools like attendance, polls, and questions.
        </p>
        <Link href="/adminlogin">
          <button className="bg-yellow-300 text-indigo-800 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-yellow-400 transition text-lg">
            Get Started
          </button>
        </Link>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Link href="/studentlogin">
            <button

              className="bg-green-500 hover:bg-green-600 transition text-white text-sm px-4 py-2 rounded-full font-semibold"
            >
              Join in a Session
            </button>
          </Link>
        </div>

      </section>

      {/* Footer */}
      <footer className="text-center py-4 text-sm">
        © 2025 Present_it. All rights reserved.<br></br> Developed as a part of Academic mini Project cse - 2K22
      </footer>
    </main>
  );
}
