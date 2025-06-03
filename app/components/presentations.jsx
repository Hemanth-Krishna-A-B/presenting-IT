"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function Presentations() {
  const [presentationTitle, setPresentationTitle] = useState("");
  const [presentationDescription, setPresentationDescription] = useState("");
  const [presentationFile, setPresentationFile] = useState(null);
  const [isLoading,setLoading] = useState(false);



  async function handleSubmit() {
  if (!presentationFile) return alert("Select a file");

  const fileFormData = new FormData();
  fileFormData.append("file", presentationFile);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return alert("Teacher Authentication Failed");

  const teacherId = userData.user.id;
  if (!teacherId) return alert("Teacher Authentication Failed");

  setLoading(true);

  try {
    const uploadRes = await fetch("https://presenting-it.onrender.com/upload/", {
      method: "POST",
      body: fileFormData,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      setLoading(false);
      return alert("Upload failed: " + JSON.stringify(err));
    }

    const { image_urls } = await uploadRes.json();

    const metaRes = await fetch("/api/presentations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: presentationTitle,
        description: presentationDescription,
        teacher_id: teacherId,
        image_urls,
      }),
    });

    if (!metaRes.ok) {
      const err = await metaRes.json();
      setLoading(false);
      return alert("Save failed: " + JSON.stringify(err));
    }

    alert("Presentation saved successfully!");
  } catch (err) {
    alert("Unexpected error: " + err.message);
  } finally {
    setLoading(false);
    setPresentationDescription("");
    setPresentationFile("");
    setPresentationTitle("");
  }
}





  return (
    <div className="animate-fade-in space-y-6 text-black">
      <h2 className="text-2xl font-semibold text-center">📊 Create a Presentation</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Presentation Title</label>
        <input
          type="text"
          value={presentationTitle}
          onChange={(e) => setPresentationTitle(e.target.value)}
          placeholder="Enter presentation title"
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          rows={4}
          value={presentationDescription}
          onChange={(e) => setPresentationDescription(e.target.value)}
          placeholder="Describe your presentation..."
          className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Upload File (PDF or PPTX)</label>
        <input
          type="file"
          accept=".pdf,.ppt,.pptx"
          onChange={(e) => setPresentationFile(e.target.files[0])}
          className="w-full"
        />
        {presentationFile && (
          <p className="mt-2 text-sm text-gray-700">
            Selected: <span className="font-medium">{presentationFile.name}</span>
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-amber-600 text-white font-semibold py-3 rounded-lg hover:bg-amber-700"
      >
        {isLoading?" Uploading...":"Submit Presentation"}
      </button>
    </div>
  );
}
