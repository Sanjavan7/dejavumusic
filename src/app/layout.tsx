import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DejaVu Music — Find the Song That Sounds Like That Other Song",
    template: "%s — DejaVu Music",
  },
  description:
    "DejaVu finds the song stuck in your head — the one that sounds like the one you just heard. AI-powered music matching for everyone.",
  keywords: [
    "music",
    "song finder",
    "sounds like",
    "similar songs",
    "AI music",
    "shazam alternative",
    "music matching",
    "dejavu music",
  ],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "DejaVu Music — Find the Song That Sounds Like That Other Song",
    description:
      "That song sounds familiar... but what IS it? DejaVu finds the song stuck in your head.",
    type: "website",
    url: "https://dejavumusic.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "DejaVu Music",
    description:
      "That song sounds familiar... but what IS it? DejaVu finds the song stuck in your head.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
