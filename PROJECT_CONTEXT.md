# PROJECT CONTEXT — REWIND (Nostalgia Web App)

> **Last updated:** 2026-07-20
> **Purpose:** Single-source reference for any AI agent or developer picking up this project.
> **Read this FIRST before touching any code.**

---

## 1. PROJECT OVERVIEW

**REWIND** is a nostalgic, emotional-wellbeing-focused single-page web app. Users pick their birth year, then explore a retro-themed dashboard with journaling, a vintage camera, mixtapes, sticker walls, a Tamagotchi pet, and a "Memory Reel" swipeable feed. Everything runs client-side — no server, no auth, no cloud. All data lives in IndexedDB.

**Design philosophy:** Warm, skeuomorphic, retro-aesthetic (CRT/VHS/70s-2010s eras). No dark patterns, no engagement metrics, no infinite scroll. Emotional wellbeing is the north star.

---

## 2. TECH STACK

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16.1.1 |
| UI Library | React | ^19.0.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 + @tailwindcss/postcss | ^4 |
| Component Library | shadcn/ui (new-york style) | — |
| Animations | Framer Motion | ^12.23.2 |
| Icons | lucide-react | ^0.525.0 |
| Database | IndexedDB via `idb` | ^8.0.3 |
| State | React hooks (useState, useEffect) + useDBState | — |
| Date Utils | date-fns | ^4.1.0 |
| UUID | uuid | ^11.1.0 |

### Installed but UNUSED (do not use or remove without asking):
- `zustand` ^5.0.6
- `@tanstack/react-query` ^5.82.0
- `@tanstack/react-table` ^8.21.3
- `next-auth` ^4.24.11
- `next-intl` ^4.3.4
- `next-themes` ^0.4.6
- `@mdxeditor/editor` ^3.39.1
- `@reactuses/core` ^6.0.5
- `react-hook-form`, `@hookform/resolvers`, `zod` (forms/validation — unused)
- `@prisma/client`, `prisma` (Prisma/SQLite — unused, boilerplate only)
- `recharts`, `react-markdown`, `react-syntax-highlighter` (unused)
- `@dnd-kit/*` (drag-and-drop — unused)
- `embla-carousel-react`, `react-resizable-panels`, `vaul`, `sonner`, `input-otp`, `cmdk`, `react-day-picker` (mostly shadcn deps, some unused)

---

## 3. FILE TREE

```
src/
├── app/
│   ├── api/route.ts              # Placeholder: GET returns { message: "Hello, world!" }
│   ├── globals.css               # ALL custom CSS: skeuomorphic textures, CRT/VHS animations, era skin variables (1004 lines)
│   ├── layout.tsx                # Root layout: Google Fonts, metadata, Toaster
│   └── page.tsx                  # ENTIRE SPA (~1400 lines): CRT boot → hero → dashboard with tabs
│
├── components/
│   ├── EraPods.tsx               # Accordion decade explorer (categories + top-5 items)
│   ├── EraSkins.tsx              # 6 era theme switcher (default/70s/80s/90s/2000s/2010s)
│   ├── MemoryVault.tsx           # Polaroid-grid vault for saved nostalgia items
│   ├── NostalgiaFeatures.tsx     # "Fun Stuff" tab: guestbook, mixtapes, stickers, tamagotchi, floppy, chat, visit counter
│   ├── OldJournal.tsx            # Full CRUD journal with mood/weather/pagination
│   ├── OldTransitionLoader.tsx   # Singleton cassette-tape loading overlay + useTypewriter hook + TypewriterText
│   ├── ThrowbackLibrary.tsx      # Searchable/filterable catalog of all nostalgia items with favorites
│   ├── VintageCamera.tsx         # Webcam with real-time vintage filter pipeline (canvas pixel processing)
│   ├── VoiceMessages.tsx         # Voice recording/playback voicemails (Web Audio API, Blob storage)
│   ├── memory-reel/
│   │   ├── index.ts              # Barrel export
│   │   ├── MemoryReelFeed.tsx    # Full-screen swipeable feed overlay
│   │   └── cards/
│   │       ├── DiscoveryCard.tsx     # Trivia/fact/song/minigame
│   │       ├── EndCard.tsx           # "All caught up" end card
│   │       ├── GrowthSignalCard.tsx  # Streak/milestone/activity growth
│   │       ├── MemoryCard.tsx        # Journal/mixtape/sticker memory
│   │       ├── ProgressIndicator.tsx # Line or dot progress bar
│   │       ├── ReactionRow.tsx       # 4 warm reaction emojis
│   │       └── ThenVsNowCard.tsx     # Flip card: memory → reflection
│   ├── settings/
│   │   └── ManageDataScreen.tsx  # Modal: export/import/clear data, storage estimate
│   └── ui/                       # 35 shadcn/ui components (standard, do NOT modify)
│       ├── LocalDataBadge.tsx    # Custom: "Your memories stay on this device" trust badge
│       └── ... (accordion, alert-dialog, badge, button, card, dialog, etc.)
│
├── hooks/
│   ├── use-mobile.ts            # useIsMobile() — 768px breakpoint
│   └── use-toast.ts             # Toast state manager
│
└── lib/
    ├── idb-store/
    │   ├── index.ts             # IndexedDB CRUD for 15 stores + export/import/clear
    │   ├── migrate.ts           # One-time localStorage → IndexedDB migration
    │   ├── types.ts             # All IDB record type definitions + DB_STORES array
    │   └── useDBState.ts        # Generic async IDB-backed React hook (replaces useState+localStorage)
    ├── memory-reel/
    │   ├── generateFeed.ts      # Builds memory/growth/discovery cards from IDB data
    │   ├── index.ts             # Barrel export
    │   └── types.ts             # FeedCard union type, REACTIONS, MOODS
    ├── image-pipeline.ts        # Per-pixel vintage photo processing (9 stages, color science)
    ├── nostalgia-data.ts        # Static dataset: 5 decades × 9 categories (~88KB, 270+ entries)
    ├── prisma-client.ts         # Singleton Prisma client (UNUSED)
    └── utils.ts                 # cn() utility (clsx + tailwind-merge)

Root-level:
├── package.json, tsconfig.json, tailwind.config.ts, postcss.config.mjs
├── components.json, next.config.ts, next-env.d.ts, eslint.config.mjs
├── bun.lock, .env, .gitignore, Caddyfile
├── prisma/schema.prisma, db/custom.db    # UNUSED — Prisma boilerplate
├── examples/websocket/                     # UNUSED — standalone examples
├── public/logo.svg, public/robots.txt
├── skills/                                 # 70+ skill directories — NOT app code
└── download/                               # User deliverables
```

---

## 4. INDEXEDDB ARCHITECTURE

**Database name:** `rewind-local-db`
**Version:** 1
**Library:** `idb` (^8.0.3)
**File:** `/src/lib/idb-store/index.ts`

### 15 Object Stores

| Store Name | Key Path | Auto-Increment | Record Type |
|---|---|---|---|
| `journal_entries` | `id` | Yes | JournalEntryRecord |
| `camera_photos` | `id` | Yes | CameraPhotoRecord |
| `mixtapes` | `id` | Yes | MixtapeRecord |
| `sticker_placements` | `id` | Yes | StickerPlacementRecord |
| `guestbook_entries` | `id` | Yes | GuestbookEntryRecord |
| `tamagotchi_state` | `key` | No | { key: string, ...state } |
| `floppy_saves` | `key` | No | { key: 'count', value: number } |
| `voicemails` | `id` | Yes | VoicemailRecord (Blob audio) |
| `chat_messages` | `id` | Yes | ChatMessageRecord |
| `memory_vault` | `key` | No | { key: 'titles', titles: string[] } |
| `era_skin` | `key` | No | { key: 'activeSkinId', skinId: string } |
| `library_favorites` | `key` | No | { key: 'favorites', titles: string[] } |
| `reel_reactions` | `key` | No | { key: string, reaction: string } |
| `reel_reflections` | `id` | Yes | ReelReflectionRecord |
| `visit_count` | `key` | No | { key: 'count', value: number } |

### CRUD API Pattern
Every store has typed functions in `/src/lib/idb-store/index.ts`:
```ts
// Example for journal_entries:
addJournalEntry(entry)     // auto-generates id
getJournalEntries()        // returns all, sorted by createdAt desc
putJournalEntry(entry)     // upsert by id
deleteJournalEntry(id)
```

### useDBState Hook
`/src/lib/idb-store/useDBState.ts` — Generic async hook for key-value stores:
```ts
const [value, setValue] = useDBState('era_skin', 'activeSkinId', 'default');
// Automatically loads from IDB on mount, writes back on change
```

### Migration
`/src/lib/idb-store/migrate.ts` — One-time migration from 14 legacy localStorage keys to IndexedDB. Runs automatically on app load. Idempotent (checks `rewind_db_migrated` flag). Converts base64 voicemails to Blobs.

### Legacy localStorage Keys (ONLY in migrate.ts, nowhere else)
`rewind_journal_entries`, `rewind_voicemails`, `rewind_mixtapes`, `rewind_sticker_wall`, `rewind_guestbook`, `rewind_tamagotchi`, `rewind_floppy_saves`, `rewind_chat_messages`, `rewind_memory_vault`, `rewind_era_skin`, `rewind_library_favorites`, `rewind_reel_reactions`, `rewind_reel_reflections`, `rewind_visit_count`

**RULE: Never add new localStorage usage. Always use IndexedDB.**

---

## 5. COMPONENT HIERARCHY

```
layout.tsx (RootLayout)
  └── Toaster
  └── page.tsx (ENTIRE APP)

page.tsx
  ├── CrtLoadingScreen (inline) — BIOS boot sequence
  ├── DustMotes (inline) — floating particles
  ├── OldTransitionLoader (singleton) — cassette-tape transition overlay
  ├── ManageDataScreen (modal) — triggered from footer
  ├── MemoryReelFeed (fullscreen overlay) — "Reel" tab
  │   ├── ProgressIndicator
  │   ├── MemoryCard → InlineMoodPicker + ReactionRow
  │   ├── ThenVsNowCard → ReactionRow
  │   ├── GrowthSignalCard → ReactionRow
  │   ├── DiscoveryCard → ReactionRow
  │   └── EndCard
  ├── HeroSection (inline) — birth year picker
  └── Dashboard (inline) — 7 tabs
      ├── QuoteBanner (inline)
      ├── MemoryCard (inline — category grid, NOT the reel one)
      ├── CategoryGrid (inline)
      ├── PersonalTimeline (inline)
      ├── EraSpotlight (inline)
      ├── OldJournal — CRUD with mood/weather/pagination
      ├── NostalgiaFeatures ("Fun Stuff" tab)
      │   ├── ThrowbackLibrary → Input
      │   ├── EraPods
      │   ├── MemoryVault
      │   ├── EraSkins → Button
      │   ├── VoiceMessages
      │   └── LocalDataBadge
      ├── VintageCamera — webcam + canvas filter pipeline
      ├── MemoryMatchGame (inline)
      ├── GuessTheYearGame (inline)
      └── WhackGame (inline)
```

---

## 6. DATA FLOW

### User Journey
1. CRT boot screen plays (~3s)
2. Hero section: user picks birth year → cassette transition → Dashboard
3. Dashboard has 7 tabs: Reel, Journal, Fun Stuff, Camera, Library, Eras, Settings
4. "Reel" opens Memory Reel as fullscreen overlay (ESC to close)
5. All data persists in IndexedDB across sessions

### Memory Reel Feed Generation
`/src/lib/memory-reel/generateFeed.ts` — `generateFeed({birthYear})` returns `FeedCard[]`:
1. Reads journal entries, mixtapes, sticker placements from IDB
2. Builds Memory cards (every journal entry, mixtape, sticker cluster)
3. Builds Then-vs-Now cards (every 4th journal entry)
4. Builds Growth Signal cards (mood streaks 3+, activity streaks, milestones)
5. Builds Discovery cards (songs/trivia/facts/minigame from nostalgia-data, era-matched)
6. Interleaves at 3:1 personal:discovery ratio
7. Appends EndCard

### Camera Pipeline
`/src/lib/image-pipeline.ts` — 9-stage per-pixel processing:
Chromatic Aberration → Tone Curve (matte) → Contrast Flatten → Chrominance Shift → Anti-Clarity (bilateral blur) → Film Grain (Perlin noise) → Halation/Glow → Vignette → Gate Flicker (video only)

Preview runs lightweight pipeline at 360×202 @ 24fps. Capture runs full pipeline at 1280×720.

---

## 7. CSS ARCHITECTURE

### Tailwind v4 with shadcn/ui CSS Variables
- Dark mode: `@custom-variant dark (&:is(.dark *));`
- Base color: neutral
- Style: new-york

### Custom CSS Classes in globals.css (~1004 lines)

**Skeuomorphic Textures (`sk-*`):**
`sk-cork` `sk-paper` `sk-paper-aged` `sk-lined` `sk-polaroid` `sk-btn` `sk-inset` `sk-tape` `sk-pin` `sk-leather` `sk-wood` `sk-metal` `sk-sticker` `sk-vhs-label` `sk-neon-text` `sk-tv-screen` `sk-noise` `sk-game-card` `sk-scrollbar` `sk-camera-body` `sk-camera-grip`

**Typography Classes (`old-*`):**
`old-title` `old-typewriter` `old-handwritten` `old-label` `old-body` `old-btn` `old-heading` `old-quote`

**CRT/VHS Animation System:**
`.crt-screen` `.crt-scanlines` `.crt-flicker` `.crt-glow` `.crt-fadeout`
`.vhs-tracking` `.vhs-noise` `.boot-line` `.loading-bar-track` `.loading-bar-fill`

**Keyframe Animations:**
`float` `pulse-glow` `scanline` `blink-cursor` `pop-in` `shutter-click` `camera-flash` `rec-pulse` `develop` `page-turn` `ink-spread` `seal-press` `cassette-reel` `phone-ring` `sticker-pop` `floppy-eject` `dial-rotate` `dialup-progress` `tv-static` `noise-shift` `vhs-track`

**Era Skins (6 themes):**
Each skin overrides ~30 CSS custom properties via `document.documentElement.style.setProperty()`.
Skins: `default`, `70s-groovy`, `80s-neon`, `90s-grunge`, `2000s-y2k`, `2010s-minimal`

### Google Fonts
`Nunito` (400/600/700/800/900), `Playfair Display` (400/700/900 italic), `Special Elite`, `LXGW WenKai`

---

## 8. LUCIDE-REACT ICONS IN USE

**Safe to use (confirmed working):**
`ArrowDown` `ArrowDown01` `ArrowDownAZ` `ArrowLeft` `ArrowUp` `ArrowUp01` `ArrowUpZA` `Bookmark` `Calendar` `Camera` `CheckCircle2` `ChevronDown` `ChevronLeft` `ChevronRight` `Circle` `Clapperboard` `Cloud` `CloudLightning` `CloudRain` `Clock` `Download` `Droplets` `Eye` `Feather` `FileJson` `Film` `Flame` `Gamepad2` `HardDrive` `Heart` `HelpCircle` `Image` `Library` `Lock` `MessageSquare` `Minimize2` `Monitor` `Moon` `Music` `PenTool` `Phone` `Play` `Plus` `RefreshCw` `RotateCcw` `Save` `Search` `Send` `Shield` `Shuffle` `Smile` `SmilePlus` `Sparkles` `Square` `Star` `Sticker` `Sun` `SwitchCamera` `Timer` `Trash2` `Upload` `User` `Video` `X` `XCircle` `Zap`

**DO NOT USE (known missing from lucide-react):**
`FilmReel` — causes build error. Use `Clapperboard` instead.

---

## 9. KNOWN GOTCHAS

1. **`FilmReel` icon doesn't exist** in lucide-react. Use `Clapperboard` instead. This has caused build failures before.
2. **page.tsx is ~1400 lines** — it contains the entire SPA. Many components are inline (not extracted). Be careful with edits.
3. **All data is async** — IDB operations return Promises. Use the `useDBState` hook or await IDB calls in useEffect.
4. **Camera photos are Blobs** — use `URL.createObjectURL()` to display, `URL.revokeObjectURL()` to clean up. Never store base64.
5. **Voice messages are Blobs** — same Blob handling pattern as camera photos.
6. **generateFeed is async** — all data loading from IDB means the feed generation must be awaited.
7. **The app is a single page** — no routing. Everything is in `/src/app/page.tsx`.
8. **Era skins override CSS variables** at runtime — test across all 6 skins when changing colors.
9. **Framer Motion is used everywhere** — 18 files use `motion`/`AnimatePresence`. Don't remove the dependency.
10. **No tests exist** — there are zero test files. No Jest, no Vitest, no Playwright.
11. **Prisma/SQLite is unused** — `prisma/schema.prisma` and `db/custom.db` are boilerplate. The app is 100% client-side.
12. **`next.config.ts`** — check for any image domains or special config before adding external assets.
13. **CRT boot screen** — plays once on page load. State managed by `bootComplete` in page.tsx.
14. **OldTransitionLoader is a singleton** — imported and rendered once in page.tsx, triggered via `triggerOldLoader()` ref.

---

## 10. FEATURE STATUS

| Feature | Status | Storage |
|---|---|---|
| CRT/VHS Boot Screen | ✅ Complete | N/A (CSS animation) |
| Hero + Birth Year Picker | ✅ Complete | IDB (era_skin) |
| Dashboard with 7 Tabs | ✅ Complete | N/A |
| Old Journal (CRUD) | ✅ Complete | IDB (journal_entries) |
| Vintage Camera | ✅ Complete | IDB (camera_photos, Blob) |
| Image Processing Pipeline | ✅ Complete | N/A (compute) |
| Mixtapes | ✅ Complete | IDB (mixtapes) |
| Sticker Wall | ✅ Complete | IDB (sticker_placements) |
| Guestbook | ✅ Complete | IDB (guestbook_entries) |
| Tamagotchi Pet | ✅ Complete | IDB (tamagotchi_state) |
| Floppy Save Counter | ✅ Complete | IDB (floppy_saves) |
| Voice Messages | ✅ Complete | IDB (voicemails, Blob) |
| Memory Vault | ✅ Complete | IDB (memory_vault) |
| Throwback Library | ✅ Complete | IDB (library_favorites) |
| Era Pods (Decade Explorer) | ✅ Complete | N/A (static data) |
| Era Skins (6 Themes) | ✅ Complete | IDB (era_skin) |
| Memory Reel Feed | ✅ Complete | IDB (reel_reactions, reel_reflections) |
| Mini Games (3 games) | ✅ Complete | N/A |
| Manage Data Screen | ✅ Complete | IDB (all stores) |
| Local Data Trust Badge | ✅ Complete | N/A |
| IndexedDB Migration | ✅ Complete | localStorage → IDB one-time |
| Auth / User Accounts | ❌ Not started | — |
| Cloud Sync / Supabase | ❌ Not started | — |
| AI Tagging / Insights | ❌ Not started | — |
| Social / Sharing | ❌ Not started | — |

---

## 11. WORKLOG

All session work is logged in `/home/z/my-project/worklog.md`. Each task entry includes:
- Task ID, Agent name, Task description
- Work Log (step-by-step)
- Stage Summary (key results + artifacts)

**Always read the worklog before starting a new session. Always append to it after completing work.**

---

## 12. BUILD & RUN

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

**Build verification:** Run `npm run build` after any code change. The project must build with 0 errors.

**No linting issues:** The project uses ESLint but the config is minimal. Focus on TypeScript errors from `next build`.

---

## 13. ARCHITECTURE DECISIONS

1. **Single page, no routing** — The entire app lives in page.tsx. This is intentional for the retro SPA feel.
2. **Client-side only** — No server API calls. All data in IndexedDB. No auth.
3. **Framer Motion for all animations** — Consistent animation library across all 18 animated components.
4. **Skeuomorphic CSS over images** — Textures created with CSS gradients/shadows, not image assets. Keeps bundle small.
5. **Feed generation abstracted** — `generateFeed()` can be swapped from IDB to Supabase without changing UI code.
6. **Blob storage for media** — Camera photos and voice messages stored as Blobs in IDB, not base64. Significant storage savings.
7. **No engagement metrics** — No counts on reactions, no follower counts, no streak sharing. Privacy-first.