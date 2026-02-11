"use client";

import { motion } from "framer-motion";
import { Check, X, Search, MessageCircle, Clock, Sparkles } from "lucide-react";

const steps = [
  {
    icon: <Check className="w-5 h-5" />,
    text: "You hear a song",
    detail: "Shazam identifies it",
    status: "success" as const,
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    text: 'It reminds you of ANOTHER song',
    detail: '"I know this sounds like something..."',
    status: "neutral" as const,
  },
  {
    icon: <Search className="w-5 h-5" />,
    text: "You try Googling it",
    detail: '"songs that sound like..." — useless results',
    status: "fail" as const,
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    text: "You ask ChatGPT / Gemini",
    detail: '"Based on your description..." — wrong every time',
    status: "fail" as const,
  },
  {
    icon: <Clock className="w-5 h-5" />,
    text: "You scroll YouTube comments",
    detail: "Hours wasted hoping someone else asked",
    status: "fail" as const,
  },
  {
    icon: <Check className="w-5 h-5" />,
    text: "DejaVu solves this instantly",
    detail: "AI-powered music matching that actually works",
    status: "dejavu" as const,
  },
];

const statusStyles = {
  success: "bg-green-500/10 border-green-500/30 text-green-400",
  fail: "bg-red-500/10 border-red-500/30 text-red-400",
  neutral: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  dejavu: "bg-primary/10 border-primary/30 text-primary",
};

const statusIcons = {
  success: <Check className="w-4 h-4 text-green-400" />,
  fail: <X className="w-4 h-4 text-red-400" />,
  neutral: <span className="text-amber-400 text-sm font-bold">?</span>,
  dejavu: <Check className="w-4 h-4 text-primary" />,
};

export default function Problem() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            We&apos;ve all been there
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            That maddening feeling when a song is on the tip of your tongue
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-green-500/40 via-red-500/40 to-primary/40 hidden sm:block" />

          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex items-start gap-4 p-4 md:p-5 rounded-xl border ${statusStyles[step.status]} backdrop-blur-sm`}
              >
                {/* Status dot on the connecting line */}
                <div className="hidden sm:flex absolute -left-[5px] md:left-[23px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-current z-10" />

                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{step.text}</span>
                    {statusIcons[step.status]}
                  </div>
                  <p className="text-sm text-muted">{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
