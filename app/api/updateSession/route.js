import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, type, item_id } = body;
    console.log("data send from fron : " + session_id,type,item_id);

    if (!session_id || !type || !item_id) {
      return new Response(
        JSON.stringify({ error: "Missing parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const updateFields = {};
    if (type === "polls") {
      updateFields.p_id = item_id;
    } else if (type === "questions") {
      updateFields.q_id = item_id;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabaseAdmin
      .from("session")
      .update(updateFields)
      .eq("id", session_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Session updated" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
