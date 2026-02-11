"use client";

import Link from "next/link";
import { Music2, ArrowRight } from "lucide-react";

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Music2 className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">
            DejaVu<span className="text-primary">Music</span>
          </span>
        </Link>

        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary to-secondary rounded-full text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all duration-300"
        >
          Try It Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}
