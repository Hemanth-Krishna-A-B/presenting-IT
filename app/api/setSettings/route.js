import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use your service role key securely via environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { session_id, type, value } = await req.json();

    if (!session_id || !type || value === undefined) {
      return NextResponse.json(
        { error: "Missing session_id, type, or value" },
        { status: 400 }
      );
    }

    let updateData = {};

    if (type === "timer") {
      if (typeof value !== "number") {
        return NextResponse.json(
          { error: "Timer value must be a number" },
          { status: 400 }
        );
      }
      updateData.timeout = value;
    } else if (type === "leaderboard") {
      if (typeof value !== "boolean") {
        return NextResponse.json(
          { error: "Leaderboard value must be boolean" },
          { status: 400 }
        );
      }
      updateData.leaderboard = value;
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'timer' or 'leaderboard'" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("session")
      .update(updateData)
      .eq("id", session_id); // or `.eq("session_id", session_id)` depending on your schema

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to update session settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
