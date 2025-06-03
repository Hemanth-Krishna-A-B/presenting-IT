'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient'; 

export default function PhoneLogin() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();



















  /*







  //// here the logic should be assigned




*/
















  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black px-4 relative">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isSignUp ? 'Join us and start your journey.' : 'Sign in to continue.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label htmlFor="name" className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="flex-grow bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none py-2 px-1 text-gray-900 placeholder-gray-400"
                disabled={isLoading}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-grow bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none py-2 px-1 text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="password" className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="flex-grow bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none py-2 px-1 text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 py-3 rounded-lg text-white font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
              <label className="text-sm font-medium text-gray-700 sm:w-auto">
                Want to join a live session?
              </label>
              <button
                type="button"
                onClick={() => router.push('/studentlogin')}
                className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition duration-300 py-2.5 px-6 rounded-full text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-95"
                disabled={isLoading}
              >
                Attending a Session
              </button>
            </div>
          </div>
        </form>

        <div className="text-center mt-5 text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            className="text-blue-600 hover:underline font-medium"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
