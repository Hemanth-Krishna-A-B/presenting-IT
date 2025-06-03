import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use a service role key securely
);

export async function POST(req) {
  try {
    const { session_id, presentation_id } = await req.json();

    if (!session_id || !presentation_id) {
      return NextResponse.json(
        { error: "Missing session_id or presentation_id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("session")
      .update({ present_id: presentation_id })
      .eq("id", session_id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
