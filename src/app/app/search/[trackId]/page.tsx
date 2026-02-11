"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Users, Music } from "lucide-react";
import SoundsLikeResults from "@/components/app/SoundsLikeResults";
import ChatInterface from "@/components/app/ChatInterface";
import SearchBar from "@/components/app/SearchBar";
import { PageLoader } from "@/components/ui/Loading";
import type { SpotifyTrack, SimilarSong } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function SearchResultsPage() {
  const params = useParams();
  const trackId = params.trackId as string;

  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [results, setResults] = useState<SimilarSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState("Finding similar songs...");

  // Dynamic page title
  useEffect(() => {
    if (track) {
      document.title = `${track.name} by ${track.artist} — DejaVu Music`;
    }
  }, [track]);

  useEffect(() => {
    if (!trackId) return;
    loadTrackData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  async function loadTrackData() {
    setLoading(true);
    setResultsLoading(true);

    try {
      const trackRes = await fetch(`/api/spotify/track?id=${trackId}`);
      const trackData = await trackRes.json();

      if (trackData.track) {
        setTrack(trackData.track);
        setLoading(false);
        await loadSimilarSongs(trackData.track);
      } else {
        setLoading(false);
        setResultsLoading(false);
      }
    } catch (err) {
      console.error("Failed to load track data:", err);
      setLoading(false);
      setResultsLoading(false);
    }
  }

  async function loadSimilarSongs(currentTrack: SpotifyTrack) {
    try {
      setLoadingPhase("Searching Last.fm & AI...");

      const [lastfmRes, geminiRes, communityRes] = await Promise.allSettled([
        fetch(
          `/api/lastfm/similar?artist=${encodeURIComponent(currentTrack.artist)}&track=${encodeURIComponent(currentTrack.name)}`
        ).then((r) => r.json()),
        fetch(
          `/api/gemini/similar?track=${encodeURIComponent(currentTrack.name)}&artist=${encodeURIComponent(currentTrack.artist)}`
        ).then((r) => r.json()),
        supabase
          .from("song_connections")
          .select("*")
          .eq("source_track_id", trackId),
      ]);

      const lastfmTracks: Partial<SpotifyTrack>[] =
        lastfmRes.status === "fulfilled" ? lastfmRes.value.tracks || [] : [];
      const geminiSuggestions: { name: string; artist: string; reason: string }[] =
        geminiRes.status === "fulfilled" ? geminiRes.value.suggestions || [] : [];
      const communityData =
        communityRes.status === "fulfilled" ? communityRes.value.data || [] : [];

      const lastfmNames = new Set(
        lastfmTracks.map((t) => `${t.name?.toLowerCase()}|${t.artist?.toLowerCase()}`)
      );
      const geminiNames = new Set(
        geminiSuggestions.map((s) => `${s.name.toLowerCase()}|${s.artist.toLowerCase()}`)
      );

      const merged: SimilarSong[] = [];
      const seen = new Set<string>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const conn of communityData as any[]) {
        const key = `${conn.similar_track_name.toLowerCase()}|${conn.similar_artist.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push({
            id: conn.similar_track_id,
            name: conn.similar_track_name,
            artist: conn.similar_artist,
            artistId: "",
            albumArt: "",
            albumName: "",
            previewUrl: null,
            externalUrl: "",
            source: "community",
            matchReasons: [conn.reason || "Community verified"],
            confidence: 1.0,
            communityUpvotes: conn.upvotes,
          });
        }
      }

      for (const t of lastfmTracks) {
        if (!t.name) continue;
        const key = `${t.name.toLowerCase()}|${(t.artist || "").toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const inGemini = geminiNames.has(key);
        const geminiMatch = inGemini
          ? geminiSuggestions.find(
              (s) =>
                s.name.toLowerCase() === t.name!.toLowerCase() &&
                s.artist.toLowerCase() === (t.artist || "").toLowerCase()
            )
          : null;

        const reasons: string[] = [];
        if (inGemini) reasons.push("Matched by AI & Last.fm");
        if (geminiMatch?.reason) reasons.push(geminiMatch.reason);
        if (reasons.length === 0) reasons.push("Similar on Last.fm");

        merged.push({
          id: t.id || "",
          name: t.name,
          artist: t.artist || "Unknown",
          artistId: "",
          albumArt: t.albumArt || "",
          albumName: "",
          previewUrl: null,
          externalUrl: t.externalUrl || "",
          source: inGemini ? "both" : "lastfm",
          matchReasons: reasons,
          confidence: inGemini ? 0.85 : 0.6,
        });
      }

      for (const s of geminiSuggestions) {
        const key = `${s.name.toLowerCase()}|${s.artist.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);

        merged.push({
          id: "",
          name: s.name,
          artist: s.artist,
          artistId: "",
          albumArt: "",
          albumName: "",
          previewUrl: null,
          externalUrl: "",
          source: "gemini",
          matchReasons: [s.reason || "AI suggested"],
          confidence: 0.5,
        });
      }

      merged.sort((a, b) => b.confidence - a.confidence);

      // Show initial results immediately, then enrich with Spotify data
      setResults(merged);
      setResultsLoading(false);

      // Enrich results missing album art with Spotify search (batch in background)
      enrichWithSpotify(merged);
    } catch (err) {
      console.error("Failed to load similar songs:", err);
      setResultsLoading(false);
    }
  }

  async function enrichWithSpotify(songs: SimilarSong[]) {
    const needsEnrichment = songs.filter((s) => !s.albumArt);
    if (needsEnrichment.length === 0) return;

    // Lookup in batches of 5 to avoid hammering the API
    const batchSize = 5;
    const updated = [...songs];

    for (let i = 0; i < needsEnrichment.length; i += batchSize) {
      const batch = needsEnrichment.slice(i, i + batchSize);
      const lookups = batch.map(async (song) => {
        try {
          const res = await fetch(
            `/api/spotify/search?q=${encodeURIComponent(`${song.name} ${song.artist}`)}`
          );
          const data = await res.json();
          if (data.tracks?.[0]) {
            const match = data.tracks[0];
            const idx = updated.findIndex(
              (s) => s.name === song.name && s.artist === song.artist
            );
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                id: updated[idx].id || match.id,
                albumArt: match.albumArt || updated[idx].albumArt,
                albumName: match.albumName || updated[idx].albumName,
                previewUrl: match.previewUrl || updated[idx].previewUrl,
                externalUrl: match.externalUrl || updated[idx].externalUrl,
              };
            }
          }
        } catch {
          // Silently skip failed lookups
        }
      });
      await Promise.all(lookups);
      // Update state after each batch so art appears progressively
      setResults([...updated]);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Back + search bar */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Link href="/app" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>
      </div>

      {/* Source song card */}
      {track && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl bg-surface border border-border mb-6 sm:mb-8"
        >
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={track.albumName}
              width={120}
              height={120}
              className="rounded-xl shadow-lg flex-shrink-0 w-24 h-24 sm:w-[120px] sm:h-[120px]"
            />
          ) : (
            <div className="w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-xl bg-surface-light flex items-center justify-center flex-shrink-0">
              <Music className="w-10 h-10 text-muted" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
              Searching for songs that sound like
            </p>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 truncate">{track.name}</h1>
            <p className="text-muted mb-3">{track.artist}</p>
            <div className="flex items-center gap-3 flex-wrap">
              {track.externalUrl && (
                <a
                  href={track.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Spotify
                </a>
              )}
              <Link
                href={`/app/community?track=${trackId}&name=${encodeURIComponent(track.name)}&artist=${encodeURIComponent(track.artist)}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Ask Community
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {resultsLoading ? (
        <ResultsLoadingState phase={loadingPhase} />
      ) : (
        <SoundsLikeResults
          results={results}
          sourceTrackId={trackId}
          sourceTrackName={track?.name ?? ""}
          sourceArtist={track?.artist ?? ""}
        />
      )}

      {/* Chat interface */}
      {track && (
        <div className="mt-6 sm:mt-8">
          <ChatInterface
            trackName={track.name}
            artistName={track.artist}
          />
        </div>
      )}
    </div>
  );
}

function ResultsLoadingState({ phase }: { phase: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
        <p className="text-sm text-muted">{phase}</p>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface border border-border animate-pulse">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-surface-light flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-surface-light rounded w-3/5" />
                <div className="h-3 bg-surface-light rounded w-2/5" />
                <div className="flex gap-2 mt-3">
                  <div className="h-5 bg-surface-light rounded-full w-20" />
                  <div className="h-5 bg-surface-light rounded-full w-28" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
