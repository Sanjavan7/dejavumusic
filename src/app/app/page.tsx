"use client";

import { motion } from "framer-motion";
import { Music, Sparkles, Users } from "lucide-react";
import SearchBar from "@/components/app/SearchBar";

export default function AppDashboard() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Hero search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          What song is stuck in your head?
        </h1>
        <p className="text-muted text-lg mb-8">
          Search for the song you know — we&apos;ll find the one you&apos;re thinking of.
        </p>

        <SearchBar large />
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid sm:grid-cols-3 gap-4 mt-16"
      >
        <div className="p-5 rounded-xl bg-surface border border-border text-center">
          <Music className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1 text-sm">Audio Matching</h3>
          <p className="text-xs text-muted">AI analyzes melody, BPM, key, and production style</p>
        </div>
        <div className="p-5 rounded-xl bg-surface border border-border text-center">
          <Sparkles className="w-8 h-8 text-secondary mx-auto mb-3" />
          <h3 className="font-semibold mb-1 text-sm">AI Chat</h3>
          <p className="text-xs text-muted">Describe what you remember — our AI knows music deeply</p>
        </div>
        <div className="p-5 rounded-xl bg-surface border border-border text-center">
          <Users className="w-8 h-8 text-accent mx-auto mb-3" />
          <h3 className="font-semibold mb-1 text-sm">Community</h3>
          <p className="text-xs text-muted">Other music lovers help when AI can&apos;t</p>
        </div>
      </motion.div>
    </div>
  );
}
