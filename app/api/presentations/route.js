import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with Service Role key (only backend)
const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Expect JSON payload now
    const { title, description, teacher_id, image_urls } = await request.json();

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!teacher_id || typeof teacher_id !== "string" || teacher_id.trim() === "") {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    if (!Array.isArray(image_urls) || image_urls.length === 0) {
      return NextResponse.json({ error: "image_urls must be a non-empty array" }, { status: 400 });
    }

    // description is optional, can be null or string

    // Insert the new presentation record into Supabase
    const { data, error } = await supabase
      .from("presentation")
      .insert([
        {
          title,
          description: description || null,
          image_url:image_urls,
          teacher_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Database insert error", details: error }, { status: 500 });
    }

    return NextResponse.json({ presentation: data });
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error", details: err.message || err.toString() }, { status: 500 });
  }
}
