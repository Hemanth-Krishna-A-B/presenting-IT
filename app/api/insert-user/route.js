import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { uuid, email, name } = body;

    if (!uuid || !email || !name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    // 1. Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('uuid', uuid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
      });
    }

    if (existingUser) {
      return new Response(JSON.stringify({ user: existingUser, message: "User already exists" }), {
        status: 200,
      });
    }

    // 2. Generate random 4-digit room_id
    const room_id = Math.floor(1000 + Math.random() * 9000);

    // 3. Insert new user with room_id
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .insert([{ uuid, email, name, room_id }])
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ user: newUser, message: "User inserted successfully" }), {
      status: 200,
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
