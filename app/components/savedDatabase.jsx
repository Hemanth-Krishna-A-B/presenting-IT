"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SavedDatabase() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch saved data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        alert("User not authenticated");
        setLoading(false);
        return;
      }
      const teacher_id = userData.user.id;

      const res = await fetch("/api/getSavedData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id }),
      });

      if (!res.ok) {
        alert("Failed to fetch data");
        setLoading(false);
        return;
      }

      const json = await res.json();

      // Combine all items with a 'type' property
      const combinedItems = [
        ...(json.polls || []).map((item) => ({ ...item, type: "poll" })),
        ...(json.questionbank || []).map((item) => ({ ...item, type: "questionbank" })),
        ...(json.presentations || []).map((item) => ({ ...item, type: "presentation" })),
      ];

      setItems(combinedItems);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filters = ["all", "poll", "questionbank", "presentation"];

  const filteredItems = items.filter((item) => {
    const matchesType = filter === "all" || item.type === filter;
    // Use 'title' or fallback to appropriate field depending on type
    const title = item.title || item["bank-title"] || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDelete = async (type, id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      alert("User not authenticated");
      setLoading(false);
      return;
    }
    const teacher_id = userData.user.id;

    const res = await fetch("/api/deleteSavedItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, teacher_id }),
    });

    

    if (!res.ok) {
      alert("Failed to delete item");
      setLoading(false);
      return;
    }

    // Remove the deleted item from state to update UI
    setItems((prev) =>
      prev.filter((item) => !(item.type === type && item.id === id))
    );
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-white text-black">
      <h2 className="text-3xl font-bold text-center text-amber-600">
        Saved Database
      </h2>

      {/* Filter + Search Controls */}
      <div className="flex flex-wrap justify-center gap-4 items-center">
        <div className="flex gap-2 flex-wrap justify-center">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-amber-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {f === "all"
                ? "All"
                : f.charAt(0).toUpperCase() +
                  f.slice(1).replace("bank", " Bank")}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Loading indicator */}
      {loading && <p className="text-center">Loading...</p>}

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            // Choose title and description based on type
            const title = item.title || item["bank-title"] || "Untitled";
            const description = item.description || "";

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="relative group bg-white border border-gray-300 shadow-md rounded-lg p-4 transition hover:shadow-xl hover:border-amber-400"
              >
                <div className="mb-2">
                  <span className="text-xs uppercase font-semibold text-amber-600">
                    {item.type}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800 mt-1">
                    {title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                  {description}
                </p>

                <button
                  onClick={() => handleDelete(item.type, item.id)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 transition"
                  aria-label="Delete item"
                >
                  🗑️
                </button>
              </div>
            );
          })
        ) : (
          !loading && (
            <p className="text-gray-500 text-center col-span-full">
              No items found for the selected filter or search term.
            </p>
          )
        )}
      </div>
    </div>
  );
}
