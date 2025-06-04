// /app/api/leaderboard/submit/route.js (or /pages/api/leaderboard/submit.js if using pages directory)

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for write ops
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const { regno, total_score, session_id, bank_id } = await request.json();

    console.log(regno,total_score,session_id,bank_id);

    if (!regno || !session_id || !bank_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if entry exists with same regno, session_id, bank_id
    const { data: existing, error: checkError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('regno', regno)
      .eq('session_id', session_id)
      .eq('bank_id', bank_id)
      .limit(1)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine here
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      // Entry already exists — do not insert again
      return NextResponse.json({ message: 'Entry already exists, not inserting' }, { status: 200 });
    }

    // Insert new entry
    const { data, error } = await supabase.from('leaderboard').insert({
      regno,
      total_score,
      session_id,
      bank_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Score recorded', data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
