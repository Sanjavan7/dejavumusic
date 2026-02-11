"use client";

import { motion } from "framer-motion";
import { ThumbsUp, MessageCircle } from "lucide-react";

const comments = [
  {
    user: "MelodyHunter92",
    avatar: "M",
    time: "2 months ago",
    text: "Wow I was trying to think what song this reminds me of but I couldn't think of the name thanks a lot",
    likes: 847,
    replies: 124,
    color: "bg-purple-500",
  },
  {
    user: "BassDropKing",
    avatar: "B",
    time: "3 weeks ago",
    text: "You saved me lot of research my man thanks",
    likes: 1200,
    replies: 89,
    color: "bg-blue-500",
  },
  {
    user: "SarahVibes",
    avatar: "S",
    time: "1 month ago",
    text: "I've been searching for MONTHS for the song this sounds like. It's been driving me crazy. Someone please help 😭",
    likes: 2300,
    replies: 342,
    color: "bg-pink-500",
  },
  {
    user: "ChordMaster",
    avatar: "C",
    time: "5 days ago",
    text: "Does anyone else hear it?? This chorus sounds EXACTLY like another song but I can't figure out which one",
    likes: 567,
    replies: 201,
    color: "bg-orange-500",
  },
  {
    user: "NightOwlBeats",
    avatar: "N",
    time: "2 weeks ago",
    text: "Bro this is gonna bother me all night. The melody at 1:23 is SO familiar but I literally cannot place it",
    likes: 1800,
    replies: 156,
    color: "bg-cyan-500",
  },
  {
    user: "VibeCheck2024",
    avatar: "V",
    time: "4 days ago",
    text: "WHY can no app solve this?? Shazam tells me what's playing but not what it SOUNDS LIKE. Someone build this please",
    likes: 3100,
    replies: 487,
    color: "bg-green-500",
  },
];

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

export default function SocialProof() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            This happens to{" "}
            <span className="bg-gradient-to-r from-accent to-accent-warm bg-clip-text text-transparent">
              everyone
            </span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Real comments from real people. The struggle is universal.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comments.map((comment, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group p-5 rounded-xl bg-surface border border-border hover:border-primary/20 transition-all duration-300"
            >
              {/* User info */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full ${comment.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {comment.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{comment.user}</p>
                  <p className="text-xs text-muted">{comment.time}</p>
                </div>
              </div>

              {/* Comment text */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                {comment.text}
              </p>

              {/* Engagement */}
              <div className="flex items-center gap-4 text-muted">
                <div className="flex items-center gap-1.5 text-xs">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {formatNumber(comment.likes)}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {formatNumber(comment.replies)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
