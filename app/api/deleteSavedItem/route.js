import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // SERVER-ONLY key
);

export async function POST(request) {
  try {
    const { type, id, teacher_id } = await request.json();

    if (!type || !id || !teacher_id) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
      });
    }

    const tableMap = {
      poll: "polls",
      questionbank: "question-bank",
      presentation: "presentation",
    };

    const tableName = tableMap[type];

    if (!tableName) {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
      });
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id)
      .eq("teacher_id", teacher_id);

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Failed to delete item" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: "Item deleted successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
