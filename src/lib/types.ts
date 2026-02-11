// Spotify types
export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  albumArt: string;
  albumName: string;
  previewUrl: string | null;
  externalUrl: string;
}

export interface SimilarSong extends SpotifyTrack {
  source: "lastfm" | "gemini" | "community" | "both";
  matchReasons: string[];
  confidence: number;
  communityUpvotes?: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Community types
export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  reference_track_id: string | null;
  reference_track_name: string | null;
  reference_artist: string | null;
  is_solved: boolean;
  solved_track_id: string | null;
  solved_track_name: string | null;
  solved_artist: string | null;
  upvotes: number;
  created_at: string;
  updated_at: string;
  profiles?: { username: string; avatar_url: string | null };
  reply_count?: number;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  suggested_track_id: string | null;
  suggested_track_name: string | null;
  suggested_artist: string | null;
  is_accepted_answer: boolean;
  upvotes: number;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null };
}
