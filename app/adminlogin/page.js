'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
          },
        },
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Check your email to confirm your account.');
        setIsSignUp(false);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      const user = data.user;

      if (error) {
        alert(error.message);
      } else {
       
          try {
            const response = await fetch('/api/insert-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uuid: user.id,
                email: user.email,
                name: user.user_metadata.full_name || 'No Name',
              }),
            });

            const result = await response.json();
            if(result.user){
              localStorage.setItem("USER",JSON.stringify(result.user));
            }

            if (response.ok) {
              router.push("admin/dashboard");
            } else {
              alert("Error inserting user: please Try again later");
            }
          } catch (err) {
            alert("Network/server error:");
          };
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-start w-full lg:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Present_it</h1>
        <p className="text-lg text-blue-100 mb-6">
          {isSignUp
            ? 'Create an account and explore all the tools for teaching and attendance.'
            : 'Sign in to manage your sessions and student interactions.'}
        </p>
        <ul className="space-y-2 text-sm text-blue-200 list-disc list-inside">
          <li>Real-time attendance & polling</li>
          <li>Live student engagement</li>
          <li>Secure & reliable</li>
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
              {isSignUp ? 'Join us and start teaching smarter.' : 'Login to continue.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition duration-200 py-3 rounded-lg text-white font-semibold text-lg"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <span className="text-sm text-gray-700">Want to attend a session?</span>
            <button
              onClick={() => router.push('/studentlogin')}
              className="bg-green-500 hover:bg-green-600 transition text-white text-sm px-4 py-2 rounded-full font-semibold"
            >
              Join as Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
