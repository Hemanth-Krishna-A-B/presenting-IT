import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { teacher_id } = await request.json();

    if (!teacher_id || typeof teacher_id !== "string") {
      return NextResponse.json(
        { error: "teacher_id is required and must be a string" },
        { status: 400 }
      );
    }

    // Fetch polls and questions owned by the teacher
    const [{ data: polls, error: pollsError }, { data: questionbank, error: qbError }] =
      await Promise.all([
        supabase.from("polls").select("*").eq("teacher_id", teacher_id),
        supabase.from("question-bank").select("*").eq("teacher_id", teacher_id),
      ]);

    if (pollsError || qbError) {
      return NextResponse.json(
        {
          error: "Failed to fetch data",
          details: { pollsError, qbError },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      polls: polls || [],
      questionbank: questionbank || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: err.message || err.toString() },
      { status: 500 }
    );
  }
}
