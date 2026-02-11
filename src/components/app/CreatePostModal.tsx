"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import type { SpotifyTrack } from "@/lib/types";

interface CreatePostModalProps {
  onClose: () => void;
  onCreated: () => void;
  defaultTrackId?: string;
  defaultTrackName?: string;
  defaultArtist?: string;
}

export default function CreatePostModal({
  onClose,
  onCreated,
  defaultTrackId,
  defaultTrackName,
  defaultArtist,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState(
    defaultTrackName ? `What song sounds like "${defaultTrackName}"?` : ""
  );
  const [description, setDescription] = useState("");
  const [refTrackId, setRefTrackId] = useState(defaultTrackId || "");
  const [refTrackName, setRefTrackName] = useState(defaultTrackName || "");
  const [refArtist, setRefArtist] = useState(defaultArtist || "");
  const [trackSearch, setTrackSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(q: string) {
    setTrackSearch(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSearchResults(data.tracks || []);
  }

  function selectTrack(track: SpotifyTrack) {
    setRefTrackId(track.id);
    setRefTrackName(track.name);
    setRefArtist(track.artist);
    setTrackSearch("");
    setSearchResults([]);
    if (!title) {
      setTitle(`What song sounds like "${track.name}"?`);
    }
  }

  async function handleSubmit() {
    if (!user) return;
    if (!title.trim() || !description.trim()) {
      toast("Please fill in title and description", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: title.trim(),
          description: description.trim(),
          referenceTrackId: refTrackId || null,
          referenceTrackName: refTrackName || null,
          referenceArtist: refArtist || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      toast("Post created!", "success");
      onCreated();
    } catch {
      toast("Failed to create post", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold">Ask the Community</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Reference track */}
          {refTrackName ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
              <div>
                <p className="text-xs text-muted">Reference song</p>
                <p className="text-sm font-medium">
                  {refTrackName} — {refArtist}
                </p>
              </div>
              <button
                onClick={() => {
                  setRefTrackId("");
                  setRefTrackName("");
                  setRefArtist("");
                }}
                className="text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Attach a reference song (optional)"
                value={trackSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                  {searchResults.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => selectTrack(t)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-light text-left text-sm"
                    >
                      <span className="font-medium truncate">{t.name}</span>
                      <span className="text-muted text-xs truncate">— {t.artist}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            placeholder="Title (e.g. What song sounds like...?)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
          />

          {/* Description */}
          <textarea
            placeholder="Describe what you remember — vocals, melody, where you heard it, any lyrics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />

          <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
            {loading ? "Posting..." : "Post to Community"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
