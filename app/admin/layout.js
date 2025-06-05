"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Layout({ children }) {
    const menuItems = [
        { name: "createdata", path: "/admin/createContent" },
        { name: "reports", path: "/admin/reports" },
        { name: "dashboard", path: "/admin/dashboard" },
        { name: "saved", path: "/admin/database" },
        { name: "settings", path: "/admin/settings" },
    ];

    const pathname = usePathname();
    const router = useRouter();

    const [clockActive, setClockActive] = useState(false);
    const [randomNumber, setRandomNumber] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const sessionRaw = localStorage.getItem("SESSION");
        if (sessionRaw) {
            try {
                const sessionId = JSON.parse(sessionRaw);
                setRandomNumber(sessionId);
                setClockActive(true);
            } catch (error) {
                console.error("Invalid SESSION data in localStorage");
            }
        }
    }, []);

    const toggleClock = async () => {
        if (!clockActive) {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                console.error("User not authenticated");
                alert("User not authenticated");
                return;
            }
            try {
                const res = await fetch("/api/createSession", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ teacher_id: user.id }),
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Failed to create session");
                localStorage.setItem("SESSION", JSON.stringify(result.id));
                setRandomNumber(result.id);
            } catch (err) {
                alert("Error creating session: " + err.message);
            }
        } else {
            if (!randomNumber) return; // no session to stop
            try {

                const res = await fetch("/api/stopSession", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: randomNumber }),
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Failed to stop session");
                localStorage.removeItem("SESSION");
                setRandomNumber(null);
                fetch(`https://present-it-backend-2.onrender.com/generate-report?session_id=${randomNumber}`, {
                    method: "POST",
                    keepalive: true,
                });

            } catch (err) {
                alert("Error stopping session: " + err.message);
            }
        }
        setClockActive(!clockActive);
    };


    const handleLogout = async () => {
        if (randomNumber) {
            try {
                const res = await fetch("/api/stopSession", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: randomNumber }),
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Failed to stop session");

                localStorage.removeItem("SESSION");
                setRandomNumber(null);
            } catch (err) {
                alert("Error stopping session: " + err.message);
            }
        }

        fetch(`https://present-it-backend-2.onrender.com/generate-report?session_id=${randomNumber}`, {
            method: "POST",
            keepalive: true,
        });

        await supabase.auth.signOut();
        localStorage.clear();
        router.push("/");
    };



    return (
        <div className="flex flex-col h-screen w-full">
            <nav className="bg-slate-900 text-gray-300 shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <ul className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide uppercase">
                        {menuItems.map(({ name, path }) => (
                            <li key={name}>
                                <Link href={path}>
                                    <span
                                        className={`cursor-pointer relative py-1 transition-colors duration-300 ${pathname === path
                                            ? "text-amber-400 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-400"
                                            : "hover:text-amber-400"
                                            }`}
                                    >
                                        {name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Right Side Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleClock}
                            className={`px-2 py-3 text-base font-bold transition-colors duration-300 shadow-md ${clockActive
                                ? "text-amber-300 hover:bg-amber-600"
                                : "text-white hover:bg-gray-600"
                                }`}
                            aria-pressed={clockActive}
                        >
                            {clockActive ? `Session ID: ${randomNumber}` : "Present_IT"}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-semibold"
                        >
                            Logout
                        </button>

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden ml-2 p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <ul className="md:hidden bg-gray-700 text-sm font-semibold tracking-wide uppercase space-y-2 px-6 py-4">
                        {menuItems.map(({ name, path }) => (
                            <li key={name}>
                                <Link href={path}>
                                    <span
                                        className={`cursor-pointer py-1 block transition-colors duration-300 ${pathname === path
                                            ? "text-amber-400 border-l-4 border-amber-400 pl-3"
                                            : "hover:text-amber-400"
                                            }`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full text-left py-2 text-red-400 hover:text-red-500 font-semibold"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                )}
            </nav>

            <main className="flex-grow overflow-auto">{children}</main>
        </div>
    );
}
