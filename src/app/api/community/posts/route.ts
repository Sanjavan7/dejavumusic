import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const filter = request.nextUrl.searchParams.get("filter") || "recent";
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  try {
    let query = supabase
      .from("community_posts")
      .select("*, profiles(username, avatar_url)")
      .limit(limit);

    if (filter === "unsolved") {
      query = query.eq("is_solved", false).order("created_at", { ascending: false });
    } else if (filter === "popular") {
      query = query.order("upvotes", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ posts: data });
  } catch (error) {
    console.error("Community posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, referenceTrackId, referenceTrackName, referenceArtist } =
      body;

    if (!userId || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        user_id: userId,
        title,
        description,
        reference_track_id: referenceTrackId || null,
        reference_track_name: referenceTrackName || null,
        reference_artist: referenceArtist || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
