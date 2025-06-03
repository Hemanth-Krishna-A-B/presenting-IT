import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with server-side env vars (service role key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Parse JSON body to get teacher_id
    const { teacher_id } = await request.json();

    if (!teacher_id || typeof teacher_id !== "string") {
      return NextResponse.json(
        { error: "teacher_id is required and must be a string" },
        { status: 400 }
      );
    }

    // Fetch polls by teacher_id
    const { data: polls, error: pollsError } = await supabase
      .from("polls")
      .select("*")
      .eq("teacher_id", teacher_id);

    // Fetch question bank by teacher_id
    const { data: questionbank, error: qbError } = await supabase
      .from("question-bank")
      .select("*")
      .eq("teacher_id", teacher_id);

    // Fetch presentations by teacher_id
    const { data: presentations, error: presError } = await supabase
      .from("presentation")
      .select("*")
      .eq("teacher_id", teacher_id);

    if (pollsError || qbError || presError) {
      return NextResponse.json(
        {
          error: "Database fetch error",
          details: { pollsError, qbError, presError },
        },
        { status: 500 }
      );
    }

    // Return all data
    return NextResponse.json({
      polls: polls || [],
      questionbank: questionbank || [],
      presentations: presentations || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: err.message || err.toString() },
      { status: 500 }
    );
  }
}
