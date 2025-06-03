'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';


export default function LaptopLogin() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  
/*







  //// here the logic should be assigned




*/















  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to MyApp</h1>
        <p className="text-lg text-blue-100 mb-6">
          {isSignUp
            ? 'Create an account and explore all the amazing features we offer.'
            : 'Sign in to your account and continue where you left off.'}
        </p>
        <ul className="space-y-2 text-sm text-blue-200 list-disc list-inside">
          <li>Fast and secure platform</li>
          <li>Built for modern users</li>
          <li>24/7 support and updates</li>
        </ul>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {isSignUp ? 'Join us and start your journey.' : 'Sign in to continue.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="flex flex-col sm:flex-row sm:items-center">
                <label htmlFor="name" className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  className="flex-grow border-b border-gray-300 focus:border-blue-500 outline-none py-2 px-1 text-gray-900 placeholder-gray-400"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center">
              <label htmlFor="email" className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                required
                className="flex-grow border-b border-gray-300 focus:border-blue-500 outline-none py-2 px-1 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
              <label htmlFor="password" className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                required
                className="flex-grow border-b border-gray-300 focus:border-blue-500 outline-none py-2 px-1 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 py-3 rounded-lg text-white font-semibold text-lg"
              >
                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              className="text-blue-600 hover:underline font-medium"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
            <label className="text-sm font-medium text-gray-700 sm:w-auto">
              Want to join a live session?
            </label>
            <button
              type="button"
              onClick={() => router.push('/studentlogin')}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition duration-300 py-2.5 px-6 rounded-full text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-95"
            >
              Attending a Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
