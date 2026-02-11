"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Music2, Send, Search } from "lucide-react";
import UserAvatar from "@/components/app/UserAvatar";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Loading";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import type { CommunityPost, CommunityReply, SpotifyTrack } from "@/lib/types";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyTrackSearch, setReplyTrackSearch] = useState("");
  const [replySearchResults, setReplySearchResults] = useState<SpotifyTrack[]>([]);
  const [suggestedTrack, setSuggestedTrack] = useState<SpotifyTrack | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadPost();
    loadReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function loadPost() {
    const { data } = await supabase
      .from("community_posts")
      .select("*, profiles(username, avatar_url)")
      .eq("id", postId)
      .single();

    setPost(data);
    setLoading(false);
  }

  async function loadReplies() {
    const res = await fetch(`/api/community/replies?postId=${postId}`);
    const data = await res.json();
    setReplies(data.replies || []);
  }

  async function handleReply() {
    if (!user || !replyContent.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/community/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId: user.id,
          content: replyContent.trim(),
          suggestedTrackId: suggestedTrack?.id || null,
          suggestedTrackName: suggestedTrack?.name || null,
          suggestedArtist: suggestedTrack?.artist || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setReplies((prev) => [...prev, data.reply]);
      setReplyContent("");
      setSuggestedTrack(null);
      toast("Reply posted!", "success");
    } catch {
      toast("Failed to post reply", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleAcceptAnswer(reply: CommunityReply) {
    if (!user || !post || post.user_id !== user.id) return;

    try {
      // Mark reply as accepted
      await supabase
        .from("community_replies")
        .update({ is_accepted_answer: true })
        .eq("id", reply.id);

      // Mark post as solved
      await supabase
        .from("community_posts")
        .update({
          is_solved: true,
          solved_track_id: reply.suggested_track_id,
          solved_track_name: reply.suggested_track_name,
          solved_artist: reply.suggested_artist,
        })
        .eq("id", postId);

      // Create a song connection if there's a reference track and suggested track
      if (post.reference_track_id && reply.suggested_track_id) {
        await supabase.from("song_connections").insert({
          source_track_id: post.reference_track_id,
          source_track_name: post.reference_track_name,
          source_artist: post.reference_artist,
          similar_track_id: reply.suggested_track_id,
          similar_track_name: reply.suggested_track_name,
          similar_artist: reply.suggested_artist,
          reason: "Community solved",
          created_by: user.id,
        });
      }

      toast("Answer accepted! This helps everyone find songs.", "success");
      loadPost();
      loadReplies();
    } catch {
      toast("Failed to accept answer", "error");
    }
  }

  async function searchTrack(q: string) {
    setReplyTrackSearch(q);
    if (!q.trim()) {
      setReplySearchResults([]);
      return;
    }
    const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setReplySearchResults(data.tracks || []);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Post not found</p>
        <Link href="/app/community" className="text-primary text-sm mt-2 hover:underline">
          Back to community
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === post.user_id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/app/community"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to community
      </Link>

      {/* Post */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-surface border border-border mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <UserAvatar
            username={post.profiles?.username || "User"}
            avatarUrl={post.profiles?.avatar_url}
          />
          <div>
            <p className="text-sm font-medium">{post.profiles?.username}</p>
            <p className="text-xs text-muted">{new Date(post.created_at).toLocaleDateString()}</p>
          </div>
          {post.is_solved && (
            <span className="ml-auto flex items-center gap-1 text-green-400 text-xs font-medium">
              <CheckCircle className="w-4 h-4" />
              Solved
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold mb-2">{post.title}</h1>
        <p className="text-muted leading-relaxed mb-4">{post.description}</p>

        {post.reference_track_name && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
            <Music2 className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted">Reference song</p>
              <p className="text-sm font-medium">
                {post.reference_track_name} — {post.reference_artist}
              </p>
            </div>
            {post.reference_track_id && (
              <button
                onClick={() => router.push(`/app/search/${post.reference_track_id}`)}
                className="ml-auto text-xs text-primary hover:underline"
              >
                View matches
              </button>
            )}
          </div>
        )}

        {post.is_solved && post.solved_track_name && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-green-400">Solved!</p>
              <p className="text-sm font-medium text-green-300">
                {post.solved_track_name} — {post.solved_artist}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Replies */}
      <h2 className="font-semibold mb-4">
        Replies <span className="text-muted font-normal">({replies.length})</span>
      </h2>

      <div className="space-y-3 mb-8">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className={`p-4 rounded-xl border ${
              reply.is_accepted_answer
                ? "bg-green-500/5 border-green-500/30"
                : "bg-surface border-border"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <UserAvatar
                username={reply.profiles?.username || "User"}
                avatarUrl={reply.profiles?.avatar_url}
                size="sm"
              />
              <span className="text-sm font-medium">{reply.profiles?.username}</span>
              <span className="text-xs text-muted">
                {new Date(reply.created_at).toLocaleDateString()}
              </span>
              {reply.is_accepted_answer && (
                <span className="ml-auto flex items-center gap-1 text-green-400 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Accepted
                </span>
              )}
            </div>

            <p className="text-sm text-foreground/80 mb-2">{reply.content}</p>

            {reply.suggested_track_name && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background text-sm">
                <Music2 className="w-3.5 h-3.5 text-primary" />
                <span>
                  {reply.suggested_track_name} — {reply.suggested_artist}
                </span>
              </div>
            )}

            {isAuthor && !post.is_solved && reply.suggested_track_name && (
              <button
                onClick={() => handleAcceptAnswer(reply)}
                className="mt-2 text-xs text-green-400 hover:underline"
              >
                Accept as answer
              </button>
            )}
          </div>
        ))}

        {replies.length === 0 && (
          <p className="text-center text-muted text-sm py-8">
            No replies yet. Be the first to help!
          </p>
        )}
      </div>

      {/* Reply form */}
      {user ? (
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <p className="text-sm font-medium mb-3">Post a reply</p>

          {/* Suggested track */}
          {suggestedTrack ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border mb-3 text-sm">
              <span>
                <Music2 className="w-3.5 h-3.5 text-primary inline mr-1" />
                {suggestedTrack.name} — {suggestedTrack.artist}
              </span>
              <button onClick={() => setSuggestedTrack(null)} className="text-muted hover:text-foreground text-xs">
                Remove
              </button>
            </div>
          ) : (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input
                type="text"
                placeholder="Suggest a song (optional)"
                value={replyTrackSearch}
                onChange={(e) => searchTrack(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
              {replySearchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-10 max-h-40 overflow-y-auto">
                  {replySearchResults.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSuggestedTrack(t);
                        setReplyTrackSearch("");
                        setReplySearchResults([]);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-light text-left text-xs"
                    >
                      <span className="font-medium truncate">{t.name}</span>
                      <span className="text-muted truncate">— {t.artist}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your suggestion or thoughts..."
              rows={2}
              className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
            <Button onClick={handleReply} disabled={!replyContent.trim() || sending} size="md">
              {sending ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 rounded-2xl bg-surface border border-border">
          <p className="text-muted text-sm mb-3">Sign in to reply</p>
          <Link href="/auth/login">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
