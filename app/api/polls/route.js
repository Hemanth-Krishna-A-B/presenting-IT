import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, option, image_url, teacher_id } = body;

    if (!title || !option || !teacher_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Insert new poll
    const { data, error } = await supabaseAdmin
      .from('polls')
      .insert([{ title, option, image_url, teacher_id }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ poll: data, message: "Poll created successfully" }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
