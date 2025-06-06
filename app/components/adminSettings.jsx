"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UserSessionInfo() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Error fetching user:", authError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("name, email, room_id")
        .eq("uuid", user.id)
        .single();

      if (error) {
        console.error("Failed to fetch user profile:", error);
      } else {
        setUserData(data);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleCloseSession = async () => {
  const sessionData = JSON.parse(localStorage.getItem("SESSION"));
  console.log(sessionData);
  if (sessionData) {
    return alert("Cannot clear Session when you have an active session online.");
  }

  if (!userData?.room_id) return;
  setClosing(true);

  try {
    // Get logged-in user ID from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Failed to get user:", userError);
      setClosing(false);
      return;
    }

    const userId = user.id;
    const cleanupUrl = `https://presenting-it.onrender.com/cleanup-unused-sessions?user_id=${userId}`;

    const response = await fetch(cleanupUrl, {
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cleanup failed: ${errorText}`);
    }

    const data = await response.json();

    if (data.sessions && data.sessions.length > 0) {
      alert(`Closed and cleaned ${data.sessions.length} session(s).`);
    } else {
      alert("No active sessions to clean.");
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
    alert("Failed to clean sessions: " + error.message);
  } finally {
    setClosing(false);
  }
};


  if (loading) return <p className="text-gray-600">Loading user data...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-5 max-w-md mx-auto text-black mt-20">
      <h2 className="text-lg font-semibold mb-4">User Info</h2>
      <div className="mb-2"><strong>Name:</strong> {userData?.name || "N/A"}</div>
      <div className="mb-2"><strong>Email:</strong> {userData?.email || "N/A"}</div>
      <div className="mb-4"><strong>Room ID:</strong> {userData?.room_id || "N/A"}</div>

      <button
        onClick={handleCloseSession}
        disabled={closing}
        className={`w-full py-2 rounded-md font-semibold transition ${closing ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"
          }`}
      >
        {closing ? "Closing..." : "Close Active Session"}
      </button>
    </div>
  );
}
