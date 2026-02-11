import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("community_replies")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ replies: data });
  } catch (error) {
    console.error("Replies fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, userId, content, suggestedTrackId, suggestedTrackName, suggestedArtist } =
      body;

    if (!postId || !userId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("community_replies")
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        suggested_track_id: suggestedTrackId || null,
        suggested_track_name: suggestedTrackName || null,
        suggested_artist: suggestedArtist || null,
      })
      .select("*, profiles(username, avatar_url)")
      .single();

    if (error) throw error;

    return NextResponse.json({ reply: data });
  } catch (error) {
    console.error("Create reply error:", error);
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }
}
