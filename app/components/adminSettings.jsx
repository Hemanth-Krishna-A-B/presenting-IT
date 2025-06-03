"use client"
import { useState, useRef, useEffect } from "react";

export default function AdminSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@example.com");
  const [profilePic, setProfilePic] = useState(null);

  // To track the original state to detect changes
  const [initialData, setInitialData] = useState({ name: "", email: "admin@example.com", profilePic: null });
  const [isDirty, setIsDirty] = useState(false);

  const fileInputRef = useRef(null);

  // Set initialData when component mounts or when relevant data changes externally
  useEffect(() => {
    setInitialData({ name, email, profilePic });
  }, []);

  // Check if data has changed to enable submit button
  useEffect(() => {
    const changed =
      name !== initialData.name ||
      email !== initialData.email ||
      profilePic !== initialData.profilePic;
    setIsDirty(changed);
  }, [name, email, profilePic, initialData]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      setName("");
      setEmail("");
      setProfilePic(null);
      alert("All data deleted.");
      setInitialData({ name: "", email: "", profilePic: null });
      setIsDirty(false);
    }
  };

  const handleExportAll = () => {
    const data = { name, email, profilePic };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    // Replace this with your actual update logic/API call
    console.log("Saving changes:", { name, email, profilePic });
    alert("Changes saved!");

    // Update initialData to current to reset dirty state
    setInitialData({ name, email, profilePic });
    setIsDirty(false);
  };

  return (
    <div className="w-full max-w-3xl md:max-w-2xl sm:max-w-full mx-auto px-4 md:px-6 py-6 mt-3 bg-white rounded-xl shadow-md text-black sm:rounded-none sm:mt-0 sm:shadow-none">
      {/* Avatar Upload */}
      <div className="flex justify-center mb-6">
        <div
          className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer border-4 border-amber-400 hover:border-amber-600 transition"
          onClick={handleAvatarClick}
          title="Click to change profile picture"
          aria-label="Change profile picture"
        >
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-amber-200 text-amber-600 text-6xl font-bold select-none">
              {name ? name.charAt(0).toUpperCase() : "A"}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleProfilePicChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Name Input */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Email Input */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleDeleteAll}
          className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Delete All Data
        </button>
        <button
          onClick={handleExportAll}
          className="flex-1 bg-amber-600 text-white font-semibold py-3 rounded-lg hover:bg-amber-700 transition duration-300"
        >
          Export All Data
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isDirty}
        className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${isDirty
            ? "bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
      >
        Save Changes
      </button>
    </div>
  );
}
