# Rewind

> **A personal nostalgia and memory experience, shaped by your era.**

Rewind is a browser-based memory archive and interactive nostalgia experience. Choose a
birth year from 1970–2019 to shape the dashboard’s decade theme, personal timeline, and
era-specific content. Capture and organize photos, write locally stored journal entries,
play retro-inspired games, and explore a guided Memory Reel.

- **Product:** a personal, decade-aware space for revisiting memories and recording new ones.
- **Experience:** a responsive Next.js single-page app with a tactile, analog-inspired visual system.
- **Data model:** photos and journal entries are stored in browser IndexedDB; account, AI, and
  optional sync features use server-side services and require their configured dependencies.

## Project Links

- **Live application:** [nostalgia-kohl.vercel.app](https://nostalgia-kohl.vercel.app/)
- **Source repository:** [sseraladen-svg/Rewind-HCS](https://github.com/sseraladen-svg/Rewind-HCS)
- **Product walkthrough:** [Demo video](public/rewind-app-demo.mp4)
- **Screenshots:** [download/](download/)

---

## Demo Video

A full walkthrough is available at `public/rewind-app-demo.mp4`. Screenshots are in `download/`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web framework | Next.js 16 App Router |
| Language and UI | TypeScript 5, React 19 |
| Styling | Tailwind CSS 4, custom CSS, `tw-animate-css` |
| UI primitives | Radix UI with project-local components |
| Motion | Framer Motion 12 |
| Browser persistence | IndexedDB through `idb` |
| Server persistence | PostgreSQL through Prisma 6 |
| Authentication | NextAuth 4 credentials provider |
| Image processing | Project-specific Canvas 2D pipeline |
| Icons | Lucide React |
| Hosting | Vercel production deployment |
| Runtime | Node.js |

---

## Product Capabilities

The dashboard has seven sections. Feature status is stated explicitly so a visual demo
or prototype is not mistaken for a production integration.

| Capability | Status | Scope |
|---|---|---|
| Birth-year personalization | Available | Select 1970–2019 to set decade styling, timeline, and era content. |
| First-run guide | Available | A dismissible, repeatable walkthrough introduces the dashboard features. |
| Memory Reel | Available | Locally generated, scrollable cards with reactions and reflections. |
| Retro games | Available | Memory Match, Guess The Year, and Tap The Memory run in the browser. |
| Vintage Camera | Available with permission | Camera capture and filters require a supported browser and camera permission. |
| Memory gallery | Available | Browse, upload, download, and remove photos stored in browser IndexedDB. |
| Journal | Available locally | Write and browse entries saved in browser IndexedDB. |
| Contacts | Interactive demo | Rotary-phone interactions, locally stored voice recordings, and scripted retro chat. |
| Timeline | Available with demo content | Personal and photo timelines; the shared-board area includes sample content and simulated reactions, not live multi-user collaboration. |
| AI Insights | Service-dependent | Requires sign-in and a working server-side AI provider integration. |
| Account and cloud sync | Service-dependent | Require a reachable PostgreSQL database and valid authentication/deployment configuration. |
| Movies | In development — locked | Not available from the dashboard. The tab displays a lock and explains the status. |

### User-facing details

- **Reel:** a full-screen feed of memories, discoveries, and then-versus-now cards.
- **Games:** match era-themed cards, guess when a cultural item became popular, or tap
  items in a timed round.
- **Camera and Memory:** capture photos with vintage filters, then browse them in a
  grid or filmstrip. Video clips are available in the camera session; photo persistence
  is provided by the Memory gallery.
- **Journal:** write entries and add mood or weather labels.
- **Contacts:** try the rotary phone, record and play local voice messages, or chat with
  scripted nostalgic auto-replies.
- **Timeline:** explore age-based milestones, captured-photo dates, and the sample
  Memory Board.

## First-Run Walkthrough

1. **Choose your birth year.** Enter a year from 1970 to 2019, or select a decade
   shortcut. The year determines your era content and age-based life timeline; changing
   the year can change the dashboard theme and the milestones shown.
2. **Follow the starter guide.** When the dashboard first opens, use **Next** and
   **Back** to learn one feature at a time. You can skip the tour and reopen it later
   with the book icon in the header.
3. **Start with the Memory Reel or Games.** Open **Reel** to move through a full-screen
   memory feed. In **Games**, choose a game card, follow its on-screen instructions,
   and use **Back to Games** to pick another.
4. **Try the camera.** Select the camera icon in the header, allow camera access, choose
   a filter, and capture a photo or record a short clip. Switch photo/video mode or
   front/rear cameras from the camera controls. Camera access requires a secure browser
   context (HTTPS, or localhost) and a camera-equipped device.
5. **Review and keep photos.** Open **Memory** to browse captured photos, upload images
   from your device, switch grid/filmstrip views, or download and delete items.
6. **Write and explore.** Use **Journal** for a dated entry with mood and weather tags;
   **Contacts** for the rotary phone, local voice recordings, and scripted chat; and
   **Timeline** for milestones, photo dates, and the sample Memory Board.
7. **Find tools and preferences.** Search with the magnifier or **Ctrl/⌘ K**. Use
   **Settings** for preferences and data-management options. Sign-in is optional for
   local browsing, but account and sync actions require the server services described
   in [Configuration and account requirements](#configuration-and-account-requirements).
8. **Know what is not open yet.** The **Movies** tab is locked while that feature is in
   development. Its status notice is informational; movie browsing is not currently
   available.

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
│   ├── GamesHub.tsx             # Memory Match, Guess The Year, and Tap The Memory
│   ├── MoviesTab.tsx             # Movie browser component; dashboard entry is locked
│   ├── ContactsTab.tsx           # Subfolder navigator (phone/voice/chat)
│   ├── MemoryTab.tsx             # Photo grid/filmstrip/lightbox
│   ├── VintageCamera.tsx         # Full camera with 8 vintage filters (846 lines)
│   ├── PhotoTimeline.tsx         # Chronological photo timeline
│   ├── MemoryBoard.tsx           # Personal board and sample shared-board content
│   ├── FirstRunGuide.tsx         # Step-by-step feature tour and Movies development notice
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
│   └── ui/                     # Shared UI primitives
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
│   ├── prisma-client.ts           # Prisma client initialization
│   └── utils.ts                   # cn() helper, misc utilities
├── hooks/
│   ├── useSync.ts                # Cloud sync hook
│   ├── use-toast.ts              # Toast notification hook
│   └── use-mobile.ts             # Mobile detection hook
└── docs/
    └── STRUCTURE_RULES.md        # Component architecture guidelines

prisma/
└── schema.prisma                # PostgreSQL schema: User, Session, Account, JournalSync, AiInsight, SyncRecord, UserProfile

scripts/
├── capture-frames.cjs            # Playwright screenshot pipeline
├── record-video.cjs             # Video recording script
└── fix_posters.py                # Movie poster URL fixer

public/
├── rewind-app-demo.mp4          # Demo video
├── logo.svg                    # App logo
└── robots.txt                   # Crawler rules

next.config.ts                       # Standalone output; React strict mode enabled
tailwind.config.ts                    # Tailwind CSS 4 configuration
tsconfig.json                         # TypeScript config
```

---

## Architecture and Data Boundaries

Rewind is a Next.js App Router application with browser-side interactive features and
server routes for capabilities that require an account or external service.

| Layer | Responsibility | Persistence / dependency |
|---|---|---|
| App Router and React client components | Landing page, dashboard, feature guides, camera, games, and overlays | Browser |
| Client data layer | Photos, journal entries, chat, and other local feature state | IndexedDB, with browser-local settings where applicable |
| API routes | Registration, authentication, sync, history, movie data, and AI insights | Next.js server runtime |
| Prisma data layer | Accounts, profiles, and sync records | PostgreSQL, configured by `DATABASE_URL` |
| External integrations | AI insight generation and optional movie metadata lookup | Provider credentials and network availability |

### Data and privacy expectations

- Photos and journal entries are stored in the current browser by default. They are not
  automatically shared with other users.
- Account-backed sync requires sign-in and a reachable PostgreSQL service. Sync is an
  optional server feature; local browser storage does not depend on an account.
- When a signed-in user requests AI insights, the server sends recent journal metadata
  and short entry excerpts to the configured AI provider. Do not treat AI insights as
  device-only processing.
- The Memory Board's shared-looking area is seeded sample content with simulated
  reactions; it is not a real-time collaboration service.
- Browser camera access is requested by the client and depends on user permission.

---

## Getting Started

### Prerequisites

- **Node.js** 20.9 or newer
- **npm** (the repository includes `package-lock.json`)
- **PostgreSQL** for account creation, sign-in, and server-backed sync
- A browser with IndexedDB and Canvas 2D; camera features also require a camera and permission

### Installation

```powershell
git clone https://github.com/sseraladen-svg/Rewind-HCS.git
Set-Location Rewind-HCS

# Install dependencies and generate the Prisma client
npm ci

# Create local environment configuration
Copy-Item .env.example .env

# Configure DATABASE_URL in .env before initializing the database
npm run db:push

# Start the development server
npm run dev
```

Open `http://localhost:3000`. The app's local-first features can be explored in the
browser; account creation and cloud sync require a reachable PostgreSQL database.

### Configuration and account requirements

Set these variables in `.env` for local development:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
Do not commit `.env` or production credentials. `DATABASE_URL` must point to a database
that is reachable from the environment running the app; `NEXTAUTH_URL` must match that
environment's public origin.

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
