"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SongCard from "./SongCard";
import type { SimilarSong } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface SoundsLikeResultsProps {
  results: SimilarSong[];
  sourceTrackId: string;
  sourceTrackName: string;
  sourceArtist: string;
}

export default function SoundsLikeResults({
  results,
  sourceTrackId,
  sourceTrackName,
  sourceArtist,
}: SoundsLikeResultsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  const visible = results.filter((r) => !dismissed.has(r.id + r.name));

  async function handleConfirm(track: SimilarSong) {
    if (!user) {
      toast("Sign in to confirm matches", "info");
      return;
    }

    try {
      await supabase.from("song_connections").insert({
        source_track_id: sourceTrackId,
        source_track_name: sourceTrackName,
        source_artist: sourceArtist,
        similar_track_id: track.id,
        similar_track_name: track.name,
        similar_artist: track.artist,
        reason: track.matchReasons.join(", "),
        created_by: user.id,
      });
      toast("Match confirmed! This helps everyone.", "success");
    } catch {
      toast("Failed to save match", "error");
    }
  }

  function handleDismiss(track: SimilarSong) {
    setDismissed((prev) => new Set(prev).add(track.id + track.name));
  }

  if (visible.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No matches found yet</h3>
        <p className="text-muted max-w-sm mx-auto mb-6">
          We couldn&apos;t find similar songs automatically. Try asking the AI Chat below — it can dig deeper into niche tracks.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#chat" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            Ask AI Chat
          </a>
          <a href={`/app/community`} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-surface-light border border-border text-muted text-sm font-medium hover:text-foreground transition-colors">
            Ask the Community
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">
        Sounds like... <span className="text-muted font-normal">({visible.length} results)</span>
      </h3>
      <div className="grid gap-3">
        {visible.map((track, i) => (
          <motion.div
            key={track.id + track.name + i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <SongCard
              track={track}
              showActions
              onConfirm={handleConfirm}
              onDismiss={handleDismiss}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
