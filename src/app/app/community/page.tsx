"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, MessageCircle, CheckCircle, Clock, TrendingUp, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/app/UserAvatar";
import { Spinner } from "@/components/ui/Loading";
import { useAuth } from "@/lib/auth-context";
import type { CommunityPost } from "@/lib/types";
import CreatePostModal from "@/components/app/CreatePostModal";

const filters = [
  { key: "recent", label: "Recent", icon: Clock },
  { key: "unsolved", label: "Unsolved", icon: Filter },
  { key: "popular", label: "Popular", icon: TrendingUp },
];

function CommunityContent() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("recent");
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Auto-open create modal if coming from search page with track params
  useEffect(() => {
    if (searchParams.get("track")) {
      setShowCreate(true);
    }
  }, [searchParams]);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/posts?filter=${activeFilter}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-muted text-sm">Help others find their song — or get help finding yours</p>
        </div>
        <Button
          onClick={() => {
            if (!user) {
              window.location.href = "/auth/login";
              return;
            }
            setShowCreate(true);
          }}
          size="md"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-primary/10 text-primary"
                : "text-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            <f.icon className="w-3.5 h-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted">No posts yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/app/community/${post.id}`}
                className="block p-5 rounded-xl bg-surface border border-border hover:border-primary/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar
                    username={post.profiles?.username || "User"}
                    avatarUrl={post.profiles?.avatar_url}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{post.title}</h3>
                      {post.is_solved && (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted line-clamp-2 mb-2">{post.description}</p>
                    {post.reference_track_name && (
                      <p className="text-xs text-primary">
                        Reference: {post.reference_track_name} — {post.reference_artist}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                      <span>{post.profiles?.username}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.reply_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create post modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadPosts();
          }}
          defaultTrackId={searchParams.get("track") || undefined}
          defaultTrackName={searchParams.get("name") || undefined}
          defaultArtist={searchParams.get("artist") || undefined}
        />
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <CommunityContent />
    </Suspense>
  );
}
