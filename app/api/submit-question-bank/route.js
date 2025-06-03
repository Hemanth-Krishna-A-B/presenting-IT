import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title");
    const teacher_id = formData.get("teacher_id");
    const questionsJSON = formData.get("questions");

    if (!title || !teacher_id || !questionsJSON) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const questionsArray = JSON.parse(questionsJSON);

    // Insert question bank and get the new bank id
    const { data: bankData, error: bankError } = await supabaseAdmin
      .from("question-bank")
      .insert([{ "bank-title": title, teacher_id }])
      .select("id")
      .single();

    if (bankError) {
      console.error("Error inserting question bank:", bankError);
      return new Response(JSON.stringify({ error: "Failed to insert question bank" }), {
        status: 500,
      });
    }

    const bankId = bankData.id;

    // Process each question
    for (let i = 0; i < questionsArray.length; i++) {
      const q = questionsArray[i];
      let image_url = null;

      const imageFile = formData.get(`image-${i}`);
      if (imageFile && imageFile.size > 0) {
        // Convert file to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // File name and extension
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${bankId}/${Date.now()}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
          .from("question-images")
          .upload(fileName, buffer, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          return new Response(JSON.stringify({ error: "Failed to upload image" }), {
            status: 500,
          });
        }

        const { data } = supabaseAdmin.storage
          .from("question-images")
          .getPublicUrl(fileName);

        image_url = data.publicUrl;
      }

      // Insert question
      const { error: questionError } = await supabaseAdmin
        .from("questions")
        .insert([
          {
            title: q.question,
            option: q.options,
            correct: q.correctAnswer,
            bank_id: bankId,
            image_url: image_url,
          },
        ]);

      if (questionError) {
        console.error("Insert question error:", questionError);
        return new Response(JSON.stringify({ error: "Failed to insert question" }), {
          status: 500,
        });
      }
    }

    return new Response(
      JSON.stringify({ message: "Question bank created", bankId }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
