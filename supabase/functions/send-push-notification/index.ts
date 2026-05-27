import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization")!;
  
  // Create a Supabase client with the Service Role Key from the header
  // This allows the function to bypass RLS and read profiles
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { userId, title, body, data }: PushPayload = await req.json();

    // 1. Fetch the user's push token
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", userId)
      .single();

    if (error || !profile?.expo_push_token) {
      console.log(`No push token found for user ${userId}`);
      return new Response(JSON.stringify({ success: false, message: "No token" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = profile.expo_push_token;

    // 2. Send to Expo Push API
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body,
        data,
      }),
    });

    const result = await response.json();
    console.log(`Expo response for user ${userId}:`, result);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in push function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
