"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import LatexTextEditor from "./LatexTextEditor";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Polls() {
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index, value) => {
    setPollOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
  };

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Image upload failed");
    return data.url;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!pollQuestion.trim()) return alert("Poll question is required");
    if (pollOptions.some((opt) => !opt.trim()))
      return alert("Please fill all poll options");

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("User not authenticated");
        setLoading(false);
        return;
      }
      const teacherId = user.id;

      let image_url = null;
      if (imageFile) {
        image_url = await uploadImageToServer(imageFile);
      }

      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pollQuestion,
          option: pollOptions,
          image_url,
          teacher_id: teacherId,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create poll");

      alert("Poll created successfully!");
      setPollQuestion("");
      setPollOptions(["", "", "", ""]);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      alert(err.message || "Failed to submit poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 text-black">
      <h2 className="text-2xl font-semibold text-center">🗳️ Create a Poll</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Poll Question</label>
        <LatexTextEditor value={pollQuestion} onChange={setPollQuestion} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Optional Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imagePreview && (
          <div className="mt-3 flex justify-center">
            <img src={imagePreview} className="max-h-40 rounded-xl shadow-md" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Poll Options</label>
        <div className="space-y-4">
          {pollOptions.map((opt, i) => (
            <LatexTextEditor
              key={i}
              value={pollOptions[i]}
              onChange={(val) => handleOptionChange(i, val)}
            />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600 transition"
        >
          {loading ? "Submitting..." : "Submit Poll"}
        </button>
      </div>
    </div>
  );
}
