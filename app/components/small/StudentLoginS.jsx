'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react'; // Optional: Spinner icon

export default function StudentLoginS() {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    regNo: '',
    sessionCode: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/studentLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Login successful');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-md bg-white/40 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Student Login</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Input Group */}
          {[
            { id: 'name', label: 'Name', placeholder: 'Enter your name' },
            { id: 'studentId', label: 'Student ID', placeholder: 'Enter your ID' },
            { id: 'regNo', label: 'Registration Number', placeholder: 'Enter your reg. number' },
            { id: 'sessionCode', label: 'Session Code', placeholder: 'Enter session code' },
          ].map(({ id, label, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type="text"
                id={id}
                value={formData[id]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-md text-gray-800 transition duration-200"
                required
              />
            </div>
          ))}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r ${
                loading
                  ? 'from-blue-300 to-blue-400 cursor-not-allowed'
                  : 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              } text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95`}
            >
              {loading && <Loader2 className="animate-spin w-5 h-5" />}
              {loading ? 'Logging in...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
