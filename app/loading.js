import "./globals.css";

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="relative flex flex-col items-center gap-4">
        <p className="text-white text-2xl font-semibold animate-pulse">Loading...</p>

        <div className="w-12 h-12 border-4 border-white border-dashed rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
