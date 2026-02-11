import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/spotify";
import type { SpotifyTrack } from "@/lib/types";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.status}`);
    }

    const data = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracks: SpotifyTrack[] = data.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name ?? "Unknown",
      artistId: track.artists[0]?.id ?? "",
      albumArt: track.album.images[0]?.url ?? "",
      albumName: track.album.name,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls?.spotify ?? "",
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Spotify search error:", error);
    return NextResponse.json(
      { error: "Failed to search Spotify" },
      { status: 500 }
    );
  }
}
