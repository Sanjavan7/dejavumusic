import { NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/spotify";

export async function GET() {
  try {
    const token = await getSpotifyToken();
    return NextResponse.json({ access_token: token });
  } catch {
    return NextResponse.json(
      { error: "Failed to get Spotify token" },
      { status: 500 }
    );
  }
}
