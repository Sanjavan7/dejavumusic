# 🎵 DejaVu Music

**That song sounds familiar... but what IS it?**

DejaVu Music finds the song stuck in your head — the one that *sounds like* the one you just heard.

🔗 **Live App:** [dejavumusic.vercel.app](https://dejavumusic.vercel.app)

---

## The Problem

You hear a song. Shazam identifies it. But it *reminds* you of another song — and you can't figure out what it is.

- Shazam can't help — you don't have the other song playing
- Humming won't help — you're mixing up melodies
- AI chatbots struggle without audio context
- Your only hope? A random YouTube commenter

**DejaVu solves this instantly.**

## How It Works

DejaVu uses three layers of music intelligence:

### Layer 1 — AI Audio Analysis
Search for a song and instantly see what it sounds like. Powered by Gemini AI, it matches songs by melody, production style, chord progressions, and samples — not just genre or mood. It searches its knowledge of YouTube comments, Reddit threads, and forums where people make "this sounds like..." connections.

### Layer 2 — AI Chat
Still stuck? Chat with DejaVu's AI assistant. It already knows your song and asks smart follow-up questions: male or female vocals? Where did you hear it? Any lyrics you remember? It narrows down the answer conversationally.

### Layer 3 — Community
Unsolved? Post it for other music lovers to help. Every answered question feeds back into Layer 1, making the AI smarter over time.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **AI:** Google Gemini 2.0 Flash
- **Music Data:** Spotify Web API (search), Last.fm API (similar tracks)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, OAuth)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- API keys for: Spotify, Last.fm, Google Gemini, Supabase

### Installation

```bash
# Clone the repo
git clone https://github.com/Sanjavan7/dejavumusic.git
cd dejavumusic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
LASTFM_API_KEY=your_lastfm_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup

Run the SQL schema in your Supabase SQL Editor to create the required tables (profiles, search_history, song_connections, community_posts, community_replies).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── app/                     # Main application
│   │   ├── page.tsx             # Search dashboard
│   │   ├── search/[trackId]/    # Song results + AI chat
│   │   ├── community/           # Community feed & posts
│   │   └── profile/             # User profile
│   ├── auth/                    # Login & OAuth callback
│   └── api/                     # API routes
│       ├── spotify/             # Spotify search & track lookup
│       ├── lastfm/              # Last.fm similar tracks
│       ├── gemini/              # Gemini AI similar songs
│       ├── chat/                # AI chat endpoint
│       └── community/           # Community CRUD
├── components/
│   ├── landing/                 # Landing page components
│   └── app/                     # App components
└── lib/                         # Utilities, types, Supabase client
```

## Features

- 🔍 **Instant song search** with Spotify-powered autocomplete
- 🤖 **AI-powered "Sounds Like"** results from Gemini + Last.fm
- 💬 **Conversational AI chat** that helps narrow down your song
- 👥 **Community board** for unsolved queries
- 🔗 **Feedback loop** — every confirmed match makes the system smarter
- 🎨 **Dark theme** with music-inspired design
- 📱 **Mobile-first** responsive layout
- 🔐 **Authentication** via Supabase (email + Google OAuth)

## The Origin Story

This project was born from a real frustration: hearing "Beautiful" by Giulio Cercato and knowing it sounded like another song — but not being able to find it. After hours of asking AI chatbots, Googling, and scrolling YouTube comments, a random commenter finally revealed it was "Are You With Me" by Lost Frequencies.

DejaVu Music ensures nobody has to go through that again.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

## Roadmap

- [ ] Shazam integration for audio-based song input
- [ ] WhoSampled database integration
- [ ] YouTube comments scraping for "sounds like" connections
- [ ] Mobile app (React Native)
- [ ] Song preview playback
- [ ] User reputation system for community contributors
- [ ] Custom domain (dejavumusic.ai)

---

**Built with ❤️ for everyone who's ever had a song stuck on the tip of their tongue.**