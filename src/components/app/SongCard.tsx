"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Play, Pause, ExternalLink, Music } from "lucide-react";
import type { SimilarSong } from "@/lib/types";

interface SongCardProps {
  track: SimilarSong;
  onConfirm?: (track: SimilarSong) => void;
  onDismiss?: (track: SimilarSong) => void;
  showActions?: boolean;
}

export default function SongCard({ track, onConfirm, onDismiss, showActions = false }: SongCardProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function togglePlay() {
    if (!track.previewUrl) return;

    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(track.previewUrl);
        audioRef.current.volume = 0.5;
        audioRef.current.addEventListener("ended", () => setPlaying(false));
      }
      audioRef.current.play();
      setPlaying(true);
    }
  }

  const sourceColors = {
    community: "bg-primary/10 text-primary border-primary/30",
    both: "bg-green-500/10 text-green-400 border-green-500/30",
    lastfm: "bg-red-500/10 text-red-400 border-red-500/30",
    gemini: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  const sourceLabels = {
    community: "Community Match",
    both: "High Confidence",
    lastfm: "Last.fm",
    gemini: "AI Suggested",
  };

  return (
    <div className="group p-4 rounded-xl bg-surface border border-border hover:border-primary/20 transition-all duration-300">
      <div className="flex gap-4">
        {/* Album art + play */}
        <div className="relative flex-shrink-0">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={track.albumName || track.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-surface-light flex items-center justify-center">
              <Music className="w-8 h-8 text-muted" />
            </div>
          )}

          {track.previewUrl && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {playing ? (
                <Pause className="w-6 h-6 text-white" fill="white" />
              ) : (
                <Play className="w-6 h-6 text-white" fill="white" />
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold truncate">{track.name}</p>
              <p className="text-sm text-muted truncate">{track.artist}</p>
            </div>

            {track.externalUrl && (
              <a
                href={track.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Source badge */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${sourceColors[track.source]}`}
            >
              {sourceLabels[track.source]}
            </span>
            {track.matchReasons.slice(0, 2).map((reason, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface-light text-muted border border-border"
              >
                {reason}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          {showActions && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onConfirm?.(track)}
                className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
              >
                This is it!
              </button>
              <button
                onClick={() => onDismiss?.(track)}
                className="px-3 py-1.5 rounded-lg bg-surface-light border border-border text-muted text-xs font-medium hover:text-foreground transition-colors"
              >
                Not it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
