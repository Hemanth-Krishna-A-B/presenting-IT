"use client";
import { useState } from "react";

export default function SessionalReports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sample mock data
  const sessionReports = [
    { date: "2025-05-01", sessionId: "S001", usersJoined: 12 },
    { date: "2025-05-05", sessionId: "S002", usersJoined: 24 },
    { date: "2025-05-08", sessionId: "S003", usersJoined: 15 },
    { date: "2025-05-15", sessionId: "S004", usersJoined: 19 },
    { date: "2025-05-20", sessionId: "S005", usersJoined: 30 },
  ];

  const filterReports = () => {
    if (!startDate || !endDate) return sessionReports;
    return sessionReports.filter((r) => r.date >= startDate && r.date <= endDate);
  };

  const filteredReports = filterReports();

  const handleExportAll = () => {
    const dataStr = JSON.stringify(filteredReports, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_reports.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSingle = (report) => {
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.sessionId}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-white text-black">
      <h1 className="text-3xl font-bold text-center text-amber-600 select-none">
        Sessional Reports
      </h1>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 select-none">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 select-none">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
          />
        </div>

        <button
          onClick={handleExportAll}
          className="ml-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-md transition font-semibold shadow-sm"
          aria-label="Export all filtered session reports"
        >
          Export Filtered Reports
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
        <table className="min-w-full table-auto text-gray-900 text-sm">
          <thead className="bg-amber-100 font-semibold text-left select-none">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Session ID</th>
              <th className="border border-gray-300 px-4 py-2">Users Joined</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map(({ date, sessionId, usersJoined }, idx) => (
                <tr
                  key={sessionId}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-4 py-2">{date}</td>
                  <td className="border border-gray-300 px-4 py-2">{sessionId}</td>
                  <td className="border border-gray-300 px-4 py-2">{usersJoined}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    <button
                      onClick={() => handleExportSingle({ date, sessionId, usersJoined })}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md transition text-xs font-semibold"
                      aria-label={`Export report for session ${sessionId}`}
                    >
                      Export
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-4 italic select-none">
                  No reports found for selected dates.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
