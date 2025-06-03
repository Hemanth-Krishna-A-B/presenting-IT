"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menu, X, Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function StudentLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const timeoutRef = useRef(null);
  const channelRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const roomId = localStorage.getItem("ROOM-ID");
    if (!roomId) return;

    const channel = supabase.channel(`room:${roomId}`);

    channel.on("broadcast", { event: "item_shared" }, () => {
      console.log("Broadcast event 'item_shared' received");
      setShowNotification(true);

      // Clear existing timeout and reset 30s timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShowNotification(false);
        timeoutRef.current = null;
      }, 30000); // 30 seconds
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Subscribed to channel:", channel.topic);
        channelRef.current = channel;
      }
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    localStorage.clear();
    router.replace("/");
  };

  // Example function to broadcast an item_shared event
  // You can call this function when you want to broadcast
  const broadcastItemShared = async (type, id) => {
    if (!channelRef.current) {
      console.warn("Channel not ready yet");
      return;
    }
    try {
      await channelRef.current.send({
        type: "broadcast",
        event: "item_shared",
        payload: { type, id },
      });
      console.log("Broadcast 'item_shared' sent", { type, id });
    } catch (error) {
      console.error("Error broadcasting item_shared:", error);
    }
  };

  const navItems = [
    { label: "Presentation", href: "/student/dashboard" },
    { label: "Response", href: "/student/response" },
    { label: "Leaderboard", href: "/student/leaderboard" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="text-lg font-bold text-blue-600 flex items-center gap-2">
            Present_IT
            {showNotification && (
              <Bell className="w-5 h-5 text-red-600 animate-ping" />
            )}
          </div>
          <div className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                {item.label}
              </Link>
            ))}


            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 space-y-3 bg-white border-t">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left text-red-500 hover:text-red-600 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
