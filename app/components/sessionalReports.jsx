"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SessionalReports() {
  const [userId, setUserId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const res = await fetch("/api/getReports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setReports(data);
      } else {
        console.error("Failed to load reports:", data);
      }
      setLoading(false);
    }

    fetchReports();
  }, []);

  const downloadCSV = async (report) => {
    try {
      const response = await fetch(report.report_url);
      if (!response.ok) throw new Error("Failed to fetch CSV file");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.id}_report.csv`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading CSV:", err.message);
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return <p className="text-center p-4">Loading reports...</p>;
  }

  if (!reports.length) {
    return <p className="text-center p-4 text-gray-500">No reports found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h1 className="text-3xl font-bold text-center text-amber-600 select-none">
        Sessional Reports
      </h1>

      <table className="min-w-full border border-gray-300 rounded overflow-hidden text-gray-900 text-sm">
        <thead className="bg-amber-100 font-semibold select-none">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Session ID</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Export</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(({ id, created_at, report_url }, i) => (
            <tr key={id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-gray-300 px-4 py-2">{formatDate(created_at)}</td>
              <td className="border border-gray-300 px-4 py-2">{id}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                <button
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                  onClick={() => downloadCSV({ id, report_url })}
                  aria-label={`Download CSV report for session ${id}`}
                >
                  Export
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
