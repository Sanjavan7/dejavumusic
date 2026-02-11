import { NextRequest, NextResponse } from "next/server";
import type { SpotifyTrack } from "@/lib/types";

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get("artist");
  const track = request.nextUrl.searchParams.get("track");

  if (!artist || !track) {
    return NextResponse.json(
      { error: "Query parameters 'artist' and 'track' are required" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.LASTFM_API_KEY!;
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${apiKey}&format=json&limit=20`
    );

    if (!response.ok) {
      throw new Error(`Last.fm API failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.similartracks?.track) {
      return NextResponse.json({ tracks: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracks: Partial<SpotifyTrack>[] = data.similartracks.track.map((t: any) => ({
      id: "", // Last.fm doesn't have Spotify IDs
      name: t.name,
      artist: t.artist?.name ?? "Unknown",
      artistId: "",
      albumArt: t.image?.[2]?.["#text"] ?? "",
      albumName: "",
      previewUrl: null,
      externalUrl: t.url ?? "",
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Last.fm similar error:", error);
    return NextResponse.json(
      { error: "Failed to get similar tracks from Last.fm" },
      { status: 500 }
    );
  }
}
