"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Spinner } from "@/components/ui/Loading";
import type { SpotifyTrack } from "@/lib/types";

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.tracks) {
          setResults(data.tracks);
          setOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectTrack(track: SpotifyTrack) {
    setOpen(false);
    setQuery("");
    router.push(`/app/search/${track.id}`);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song..."
          className={`w-full pl-12 pr-12 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all ${
            large ? "py-5 text-lg" : "py-3 text-sm"
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            {loading ? <Spinner /> : <X className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => selectTrack(track)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-light transition-colors text-left"
            >
              {track.albumArt ? (
                <Image
                  src={track.albumArt}
                  alt={track.albumName}
                  width={44}
                  height={44}
                  className="rounded-md flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-md bg-surface-light flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate text-sm">{track.name}</p>
                <p className="text-xs text-muted truncate">{track.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
