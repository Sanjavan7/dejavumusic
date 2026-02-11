"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, History, Music2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import UserAvatar from "@/components/app/UserAvatar";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Loading";

interface SearchHistoryItem {
  id: string;
  spotify_track_id: string;
  track_name: string;
  artist_name: string;
  album_art_url: string | null;
  searched_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      loadHistory();
    }
  }, [user, authLoading, router]);

  async function loadHistory() {
    const { data } = await supabase
      .from("search_history")
      .select("*")
      .order("searched_at", { ascending: false })
      .limit(20);

    setHistory(data || []);
    setLoadingHistory(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!user) return null;

  const username = user.user_metadata?.name || user.email?.split("@")[0] || "User";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <UserAvatar username={username} avatarUrl={user.user_metadata?.avatar_url} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">{username}</h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="ml-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Search history */}
        <div className="rounded-2xl bg-surface border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Recent Searches</h2>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <Music2 className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-muted text-sm">No searches yet. Go find some music!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/app/search/${item.spotify_track_id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-light transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-light flex-shrink-0 overflow-hidden">
                    {item.album_art_url && (
                      <img src={item.album_art_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.track_name}</p>
                    <p className="text-xs text-muted truncate">{item.artist_name}</p>
                  </div>
                  <span className="text-xs text-muted flex-shrink-0">
                    {new Date(item.searched_at).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
