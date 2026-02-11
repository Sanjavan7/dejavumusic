"use client";

import { motion } from "framer-motion";
import { AudioLines, MessageSquare, Users } from "lucide-react";

const layers = [
  {
    number: "01",
    icon: <AudioLines className="w-8 h-8" />,
    title: "AI Audio Analysis",
    description:
      "Identify a song, instantly see what it sounds like. Matching by melody, samples, BPM, chords, and production style.",
    gradient: "from-primary to-purple-400",
    glowColor: "rgba(168, 85, 247, 0.15)",
  },
  {
    number: "02",
    icon: <MessageSquare className="w-8 h-8" />,
    title: "AI Chat",
    description:
      "Still stuck? Chat with an AI that knows music deeply. It already knows your song, searches databases, YouTube comments, Reddit, forums, and asks smart follow-up questions.",
    gradient: "from-secondary to-cyan-400",
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    number: "03",
    icon: <Users className="w-8 h-8" />,
    title: "Community",
    description:
      "Unsolved? Post it. Other music lovers help. Every answered question makes the AI smarter.",
    gradient: "from-accent to-amber-400",
    glowColor: "rgba(249, 115, 22, 0.15)",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Three layers of{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              music intelligence
            </span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Each layer gets you closer to the song you&apos;re looking for
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: layer.glowColor }}
              />
              <div className="relative h-full p-8 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all duration-300">
                {/* Layer number */}
                <span className={`text-5xl font-black bg-gradient-to-br ${layer.gradient} bg-clip-text text-transparent opacity-20`}>
                  {layer.number}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${layer.gradient} flex items-center justify-center text-white mb-5 mt-2 group-hover:scale-110 transition-transform duration-300`}>
                  {layer.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{layer.title}</h3>
                <p className="text-muted leading-relaxed">{layer.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
