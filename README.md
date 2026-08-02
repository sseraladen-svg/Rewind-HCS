# Rewind — Nostalgia-Themed SPA

> *Take a trip back to the days when life was simple. Remember who you were before the world told you who to be.*

Rewind is a skeuomorphic, decade-themed single-page application built with Next.js 16. Users enter their birth year (1970–2019) and are immersed in a fully themed nostalgia experience — complete with a CRT/VHS boot sequence, vintage camera, AIM-style chat, retro games, a hand-written journal, and more. Every surface is textured: cork boards, wood grain, aged paper, VHS labels, leather, and metal — all driven by custom CSS classes and decade-specific color palettes.

---

## Demo Video

A full walkthrough is available at `public/rewind-app-demo.mp4`. Screenshots are in `download/`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1 (standalone output, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + tw-animate-css |
| UI Components | shadcn/ui (Radix primitives) |
| Animation | Framer Motion 12 |
| State / Persistence | IndexedDB via `idb` library + Zustand |
| Database | SQLite via Prisma ORM (server-side auth/sync) |
| Auth | NextAuth 4 (credentials provider) |
| Image Processing | Custom Canvas 2D pipeline (per-pixel color science) |
| Icons | Lucide React |
| Deployment | Caddy reverse proxy (port 81) |
| Runtime | Bun / Node.js |

---

## Features

### 1. CRT / VHS Boot Screen
A cinematic loading sequence that mimics a vintage computer booting up. BIOS-style text appears line by line, followed by a glowing "REWIND" title with a progress bar, VHS scanlines, noise, and tracking distortion. Auto-dismisses after ~7 seconds or on completion.

### 2. Onboarding Flow
First-time users are guided through a multi-step onboarding wizard where they:
- Select their birth year (1970–2019)
- Choose an era skin (Paper, Leather, Polaroid, VHS Label, Noise)
- See a preview of their chosen decade's theme

Selection is persisted to IndexedDB so returning users skip onboarding.

### 3. Hero / Landing Page
A skeuomorphic landing screen with:
- Animated floating dust motes (25 particles)
- A VHS tape cassette that gently rotates
- Birth year input with decade quick-select buttons (70s, 80s, 90s, 2000s)
- Rotating nostalgic quotes per decade

### 4. Dashboard (7 Tabs)
Once the user enters their birth year, a full dashboard loads with a **wood-grain header**, **cork board main area**, and **leather footer**. The decade theme dynamically changes the background (80s = black, 90s = silver, 2000s = blue) via the `data-decade-theme` attribute and CSS variable swaps.

The 7 tabs are:

#### Reel (Clapperboard icon)
A fullscreen overlay that presents a scrollable **Memory Reel Feed** — a vertical card stack of nostalgic memories, growth signals, then-vs-now comparisons, discovery cards, and an end card. Each card uses Framer Motion for enter/exit transitions. Data is generated from the user's birth year decade.

#### Movies (Film icon)
Fetches decade-appropriate movies, TV shows, and cartoons from an internal API. Displays them in a filterable grid (Movies / TV Shows / Cartoons) with emoji poster fallbacks, ratings, and genre tags. Includes fake "Watch Now" and "Add to Queue" buttons.

#### Journal (Book icon)
A fully functional vintage journal with:
- **Mood selection** (8 moods with emoji)
- **Weather tagging** (6 weather types)
- **Rich text entry** with a lined-paper aesthetic
- **Page navigation** (previous/next entries)
- **Persistence** to IndexedDB
- **Sync** capability for authenticated users

#### Games (Gamepad icon)
Two complete retro-styled games:
- **Memory Match** — Flip cards to find matching pairs of nostalgic items (cartoons, toys, snacks). Tracks moves, matches, and time.
- **Nostalgia Quiz** — Multiple-choice trivia questions generated from the decade's data (cartoons, toys, music, movies, tech, trends). 8 questions per round with score tracking.

#### Contacts (Phone icon)
A subfolder navigator with three sections:
- **Rotary Phone** — A fully interactive rotary dial with trigonometric hole positioning, spin animation, ring shake effect, and nostalgic voicemail messages.
- **Voice Messages** — Fake voice message inbox with playback UI.
- **Retro Chat (AIM)** — A complete AIM-style instant messenger with buddy list (5 buddies with online/away/idle statuses), keyword-based auto-replies (28+ response patterns), typing indicators, timestamp display, sound toggle, and chat persistence in IndexedDB.

#### Memory (Image icon)
A photo management hub with:
- **Grid view** and **filmstrip view** toggle
- **Lightbox** with zoom and navigation
- Photos from the Vintage Camera or device gallery uploads
- Download and delete functionality
- Filter label display (Sepia 70s, Faded 80s, Warm 90s, etc.)

#### Timeline (Clock icon)
The richest tab, containing:
- **Personal Timeline** — Age-mapped life events from birth through each decade
- **Photo Timeline** — Chronological vertical timeline of camera photos with date markers and filter badges
- **Shared Memory Board** — A collaborative corkboard with sticky notes, themes (Cork, Chalkboard, Fridge), search, stats, and simulated friend reactions
- **AI Insights** — A panel for nostalgia-themed AI-generated insights
- **Emotional closing card** with a "Start Over" button

### 5. Vintage Camera (Header Icon Overlay)
A full-screen camera overlay with:
- **Live viewfinder** with real-time vintage filter preview (Canvas 2D)
- **8 filter presets**: Sepia 70s, Faded 80s, Warm 90s, B&W 60s, Polaroid, VHS, Kodak, None
- **Photo capture** with instant vintage processing
- **Video recording** (3/5/10s clips) with per-frame filter application
- **Gallery** of captured photos/videos with download and delete
- **Front/back camera** switching
- **Flash** toggle
- **Custom image processing pipeline** (823 lines) including Perlin noise, color science, gate flicker simulation, and optical imperfections

### 6. Additional Overlays & Features
- **Search Overlay** (Cmd/Ctrl+K) — Fuzzy search across tabs and content
- **Auth Modal** — Sign in / Register with credentials
- **Settings Panel** — Theme management, data export/import, account settings
- **Share Rewind** — Social sharing card generator
- **This Day in History** — Historical events matching the current date
- **Quote Banner** — Rotating decade-specific nostalgic quotes
- **Recent Memories Strip** — Horizontal scroll of recent photos (shows only if photos exist)
- **Cloud Sync** — Push/pull journal entries and photos to server for authenticated users

---

## Design System

### Decade Theme System
Themes are applied via `data-decade-theme` attribute on the dashboard container:

| Decade | Theme Key | Background | Vibe |
|--------|-----------|------------|------|
| 1980s | `80s` | `#0a0a0a` (black) | Neon, synthwave, dark luxury |
| 1990s | `90s` | `#c0c0c0` (silver) | Beige, Windows 95, grunge |
| 2000s | `2000s` | `#d6eaff` (light blue) | Y2K aesthetic, early web |
| 1970s | (default) | Warm parchment gradient | Earthy, groovy, analog |

### Texture / Skeuomorphism Classes
Custom CSS classes that create realistic material textures using gradients, shadows, and pseudo-elements:

| Class | Surface | Description |
|-------|---------|-------------|
| `sk-paper` | Aged paper | Warm off-white with subtle grain |
| `sk-cork` | Cork board | Brown textured background for main content area |
| `sk-wood` | Wood grain | Header bar with linear grain effect |
| `sk-leather` | Leather | Footer bar with leather texture |
| `sk-metal` | Brushed metal | Tab bar with metallic sheen |
| `sk-inset` | Inset/recessed | Sunken input areas |
| `sk-lined` | Lined paper | Journal-style horizontal lines |
| `sk-btn` | Raised button | Embossed button with depth |
| `sk-vhs-label` | VHS label | White sticker with border for badges |
| `sk-tape` | Masking tape | Decorative tape strip on cards |
| `sk-noise` | Film grain | Subtle noise overlay texture |

### Typography Classes
| Class | Style | Use |
|-------|-------|-----|
| `old-title` | Serif display | Headlines, decade names |
| `old-body` | Warm serif | Body text, descriptions |
| `old-typewriter` | Monospace | Metadata, timestamps, technical labels |
| `old-btn` | Bold condensed | Button labels |
| `old-label` | Uppercase tracking | Section headers, badges |
| `old-quote` | Italic serif | Pull quotes |

### Color Palette
The entire palette is warm and earthy, defined as CSS custom properties:
- **Primary**: `#8b5e3c` (warm brown)
- **Background**: `#f5edd6` (parchment)
- **Card**: `#faf6eb` (cream)
- **Accent**: `#c4956a` (copper)
- **Text**: `#3d2b1f` (dark brown), `#8b7355` (muted), `#5c4033` (strong)
- **Border**: `#c4b594` (tan)

---

## Project Structure

```
src/
├── app/
│   ├── globals.css              # 1781 lines: theme vars, texture classes, CRT/VHS animations, decade themes
│   ├── layout.tsx                # Root layout with Providers
│   ├── page.tsx                  # Main app shell (~886 lines): CRT loader, Hero, Dashboard, 7 tabs
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth credentials handler
│       ├── auth/register/          # User registration endpoint
│       ├── movies/                 # Decade movie data API
│       ├── quiz/                   # Quiz questions API
│       ├── this-day/               # Historical events API
│       ├── ai/insights/            # AI insight generation
│       ├── sync/                   # Cloud sync push/pull
│       └── user/profile/           # User profile CRUD
├── components/
│   ├── OldJournal.tsx            # Vintage journal with mood/weather/tags (IndexedDB)
│   ├── GamesHub.tsx             # Memory Match + Nostalgia Quiz
│   ├── MoviesTab.tsx             # Movie/TV/Cartoon browser
│   ├── ContactsTab.tsx           # Subfolder navigator (phone/voice/chat)
│   ├── MemoryTab.tsx             # Photo grid/filmstrip/lightbox
│   ├── VintageCamera.tsx         # Full camera with 8 vintage filters (846 lines)
│   ├── PhotoTimeline.tsx         # Chronological photo timeline
│   ├── MemoryBoard.tsx           # Collaborative corkboard with sticky notes
│   ├── OnboardingFlow.tsx       # Multi-step first-visit wizard
│   ├── SettingsTab.tsx           # Settings panel with data management
│   ├── SearchOverlay.tsx         # Cmd+K fuzzy search
│   ├── AuthModal.tsx             # Login/Register modal
│   ├── AiInsightsPanel.tsx       # AI-generated nostalgia insights
│   ├── ShareRewind.tsx           # Social sharing card
│   ├── ThisDayInHistory.tsx      # Historical events widget
│   ├── OldTransitionLoader.tsx   # Cassette tape transition animation
│   ├── RecentMemoriesStrip.tsx  # Horizontal photo strip
│   ├── memory-reel/             # Memory Reel card system
│   │   ├── cards/               # Individual reel card types
│   │   ├── MemoryReelFeed.tsx    # Feed orchestrator
│   │   └── index.ts             # Barrel export
│   ├── contacts/
│   │   ├── RotaryPhoneFolder.tsx  # Interactive rotary dial
│   │   └── RetroChatFolder.tsx   # AIM-style chat with buddy list
│   └── ui/                     # 40+ shadcn/ui primitives
├── lib/
│   ├── nostalgia-data.ts         # 473 lines: Decade data (70s–2000s), items, timeline logic
│   ├── image-pipeline.ts         # 823 lines: Per-pixel vintage filter engine
│   ├── idb-store/                # IndexedDB abstraction layer
│   │   ├── index.ts           # CRUD operations for all stores
│   │   ├── types.ts           # Type definitions
│   │   ├── useDBState.ts      # React hook for IDB state
│   │   └── migrate.ts         # localStorage → IndexedDB migration
│   ├── memory-reel/              # Memory Reel data generation
│   ├── auth.ts                    # Auth utilities
│   ├── db.ts                      # Prisma client singleton
│   ├── prisma-client.ts           # Prisma client initialization
│   └── utils.ts                   # cn() helper, misc utilities
├── hooks/
│   ├── useSync.ts                # Cloud sync hook
│   ├── use-toast.ts              # Toast notification hook
│   └── use-mobile.ts             # Mobile detection hook
└── docs/
    └── STRUCTURE_RULES.md        # Component architecture guidelines

prisma/
└── schema.prisma                # SQLite schema: User, Session, Account, JournalSync, AiInsight, SyncRecord, UserProfile

scripts/
├── capture-frames.cjs            # Playwright screenshot pipeline
├── record-video.cjs             # Video recording script
└── fix_posters.py                # Movie poster URL fixer

public/
├── rewind-app-demo.mp4          # Demo video
├── logo.svg                    # App logo
└── robots.txt                   # Crawler rules

Caddyfile                            # Reverse proxy config (port 81 → localhost:3000)
next.config.ts                       # Standalone output, Turbopack, reactStrictMode off
tailwind.config.ts                    # Tailwind CSS 4 configuration
tsconfig.json                         # TypeScript config
```

---

## Database Schema

The app uses **SQLite** via Prisma ORM for server-side data (auth, sync, profiles). Client-side data (photos, journal, chat, settings) is stored in **IndexedDB**.

### Server-side (Prisma/SQLite)

| Model | Purpose |
|-------|---------|
| `User` | User accounts with birth year and era skin preference |
| `Session` | NextAuth session tokens |
| `Account` | OAuth/provider accounts |
| `JournalSync` | Cloud-synced journal entries per user |
| `AiInsight` | AI-generated nostalgia insights |
| `SyncRecord` | Generic sync records for any IDB store |
| `UserProfile` | Extended profile with onboarding state |

### Client-side (IndexedDB)

| Store | Contents |
|-------|----------|
| `camera_photos` | Captured photos and videos (Blob URLs) |
| `journal_entries` | Journal entries with mood/weather/tags |
| `chat_messages` | AIM-style chat history |
| `era_skin` | Selected era skin and onboarding state |
| `memory_board` | Sticky notes for the Memory Board |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** latest
- **npm** or **bun** as package manager

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd my-project

# Install dependencies
npm install
# or: bun install

# Set up the database
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env` file in the project root:

```env
# Database (SQLite — defaults to file://./db/custom.db)
DATABASE_URL="file:./db/custom.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Next.js dev server on port 3000 (Turbopack) |
| `build` | `npm run build` | Production build with standalone output |
| `start` | `npm run start` | Start production server via Bun |
| `lint` | `npm run lint` | Run ESLint |
| `db:push` | `npm run db:push` | Push Prisma schema to database |
| `db:generate` | `npm run db:generate` | Generate Prisma client |
| `db:migrate` | `npm run db:migrate` | Run database migrations |
| `db:reset` | `npm run db:reset` | Reset database to clean state |

---

## Deployment

### Production Build

```bash
npm run build
npm run start
```

The app outputs in **standalone mode** (configured in `next.config.ts`), which means all necessary files are self-contained in `.next/standalone/`.

### Caddy Reverse Proxy

A `Caddyfile` is included for reverse proxy configuration:

```:81 {
    reverse_proxy localhost:3000
}```

The app is served behind Caddy on port 81, with support for dynamic port transformation via query parameters.

---

## Architecture Decisions

### Why IndexedDB for Client Data?
Photos, journal entries, and chat messages can be large (Blob data). IndexedDB provides structured storage with indexes, far exceeding the 5–10 MB limit of localStorage. A migration path from localStorage to IndexedDB is built in (`lib/idb-store/migrate.ts`).

### Why Canvas 2D for Image Filters?
Instead of CSS filters (which are limited and non-portable), the app uses a full per-pixel processing pipeline written in TypeScript. This enables:
- Perlin noise grain simulation
- Color channel manipulation (cross-processing, color shifts)
- Optical imperfections (vignette, chromatic aberration, gate flicker)
- Real-time preview at reduced resolution, full-res capture
- Consistent output across browsers

### Why Skeuomorphic Design?
The entire visual language is built around physical nostalgia — the texture of paper, the weight of leather, the grain of wood. This is achieved through pure CSS (gradients, box-shadows, pseudo-elements) rather than image assets, keeping the bundle small and the design infinitely scalable.

### Fake Buttons
Several buttons throughout the app are "UI-complete placeholders" — they look fully functional with hover states, icons, and labels, but trigger no backend action. This is intentional for the demo/MVP stage, giving the appearance of a complete feature set.

---

## Nostalgia Data

The `lib/nostalgia-data.ts` file contains 473 lines of curated cultural data for four decades (1970s–2000s), organized into categories:

- **Cartoons** — Iconic animated shows with detailed historical descriptions
- **Toys** — Classic toys with sales figures and manufacturing history
- **Music** — Definitive albums with chart performance and cultural impact
- **Movies** — Era-defining films with box office and awards data
- **Snacks** — Beloved snacks and candy with brand history
- **Games** — Classic video games with sales and development trivia
- **Trends** — Cultural phenomena and fads
- **School Life** — Classroom and school experiences
- **Tech** — Technology milestones and consumer electronics

Each item includes a `title`, `description` (2–3 sentences of real historical detail), `emoji`, and `category`. This data powers the trivia quiz, memory match game, personal timeline, and memory reel.

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` (16.1) | React framework with App Router |
| `framer-motion` (12) | Page transitions, gestures, layout animations |
| `idb` (8) | IndexedDB promise wrapper |
| `zustand` (5) | Lightweight client state management |
| `prisma` (6) | Type-safe database ORM |
| `next-auth` (4) | Authentication (credentials provider) |
| `@dnd-kit` (6/10) | Drag-and-drop for Memory Board |
| `date-fns` (4) | Date formatting and manipulation |
| `lucide-react` (0.525) | Icon library (100+ icons used) |
| `sharp` (0.34) | Server-side image processing |
| `react-markdown` (10) | Markdown rendering for AI insights |
| `cmdk` (1.1) | Command palette for search |
| `sonner` (2) | Toast notifications |

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

Requires: Camera API (for Vintage Camera), IndexedDB (for persistence), Canvas 2D (for image processing).

---

## License

Private project. All rights reserved.
