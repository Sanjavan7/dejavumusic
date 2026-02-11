import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/spotify";
import type { SpotifyTrack } from "@/lib/types";

export async function GET(request: NextRequest) {
  const trackId = request.nextUrl.searchParams.get("id");
  if (!trackId) {
    return NextResponse.json(
      { error: "Query parameter 'id' is required" },
      { status: 400 }
    );
  }

  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      throw new Error(`Spotify track fetch failed: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    const track: SpotifyTrack = {
      id: data.id,
      name: data.name,
      artist: data.artists[0]?.name ?? "Unknown",
      artistId: data.artists[0]?.id ?? "",
      albumArt: data.album.images[0]?.url ?? "",
      albumName: data.album.name,
      previewUrl: data.preview_url,
      externalUrl: data.external_urls?.spotify ?? "",
    };

    return NextResponse.json({ track });
  } catch (error) {
    console.error("Spotify track fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
