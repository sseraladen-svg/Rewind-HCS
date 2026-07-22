# REWIND Navigation Structure Rules

> This file defines the canonical 9-tab navigation structure and the
> assignment rules for any new feature added to the app.
> **Violating these rules causes navigation duplication and user confusion.**

---

## Tab Definitions

### 1. REEL — Swipeable Feed Content Only

- **What belongs:** Vertical, card-based, swipeable/scrollable feed experiences.
- **Current contents:**
  - `MemoryReelFeed` — fullscreen overlay with DiscoveryCard, MemoryCard, ThenVsNowCard, ReactionRow, ProgressIndicator, EndCard, GrowthSignalCard
- **Entry point:** Tab bar "Reel" button (opens as fullscreen overlay, not inline tab)
- **Rule:** Only feed-style card content. No static grids, no forms, no settings.

### 2. MEMORIES — Browsing / Discovery of Nostalgia Items by Category

- **What belongs:** Browsing, discovering, and viewing nostalgia data organized by category.
- **Current contents:**
  - `BreatherMessage` — rotating motivational sticky notes
  - `EraSpotlight` — auto-rotating VHS-tape card cycling through all items
  - Category filter bar (All, Cartoons, Toys, Music, Movies, Snacks, Games, Trends, School Life, Tech)
  - `CategoryGrid` -> `MemoryCard` — polaroid-styled item cards
- **Rule:** Nostalgia browsing only. No games, no personal data entry, no saved/bookmarked items (those go to Vault).

### 3. JOURNAL — Personal Written Entries Only

- **What belongs:** Writing, reading, and managing personal text entries.
- **Current contents:**
  - `OldJournal` with `JournalCover`, `EntriesList`, `EntryEditor`, `EntryViewer`
- **Rule:** Written journal entries only. No media capture (that's Camera), no social features.

### 4. CAMERA — Photo Capture and Gallery Only

- **What belongs:** Taking photos, applying filters, viewing captured photos.
- **Current contents:**
  - `VintageCamera` — webcam capture with vintage filters, saved to IndexedDB
- **Rule:** Photo capture/gallery only. No nostalgia browsing, no games.
- **Shortcut:** Floating camera FAB (bottom-right) also opens this tab.

### 5. VAULT — Saved / Bookmarked Items Only

- **What belongs:** Curated views of content the user has actively saved or bookmarked. This is a **secondary view** of data from other tabs, never a duplicate primary UI.
- **Current contents (3 sub-tabs):**
  - `MemoryVault` — bookmarked nostalgia items displayed as polaroids
  - `ThrowbackLibrary` — browsable library of ALL nostalgia items across ALL decades
  - `EraPods` — quick stats, category counts, and top-5 items per decade
- **Rule:** Saved/bookmarked items and cross-decade library views only. Never duplicate the primary browsing experience from the Memories tab.

### 6. FUN STUFF — Interactive Delight Features (Not Games, Not Browsing)

- **What belongs:** Interactive novelty features that are NOT playable games with win/lose/score state and NOT nostalgia item browsing.
- **Current contents (10 sub-sections):**
  1. `GuestbookSection` — sign-in guestbook with emoji avatars
  2. `MixtapeSection` — create mixtapes with track lists
  3. `Magic8BallSection` — ask a question, get a classic 8-ball answer
  4. `VisitCounterSection` — odometer-style visit counter
  5. `TamagotchiSection` — virtual pet with hunger/happiness/energy
  6. `FloppyDiskSection` — "save to floppy" state snapshot
  7. `RotaryPhoneSection` — interactive rotary dial with nostalgic messages
  8. `StickerWallSection` — place and drag emoji stickers on a wall
  9. `VoiceMessages` — record/play audio with waveform visualization
  10. `RetroChatSection` — fake chat with auto-reply buddy
- **Rule:** If it has a score, win state, or lose state, it's a Game. If it browses nostalgia items, it's Memories. Everything else delightful goes here.

### 7. GAMES — Playable Games with Win/Lose/Score State Only

- **What belongs:** Actual playable games with clear score, win, or lose conditions.
- **Current contents (3 games via `GamesHub`):**
  - `MemoryMatchGame` — card-flip matching with move/time tracking
  - `GuessTheYearGame` — trivia with score
  - `WhackGame` — whack-a-mole with 20-second timer and score
- **Entry point:** Hub screen with 3 game tiles, then individual game view.
- **Rule:** Only scored/competitive games. No open-ended toys (those are Fun Stuff).

### 8. TIMELINE — Personal Life Timeline + AI Insights Only

- **What belongs:** The user's personal life timeline and AI-generated analysis.
- **Current contents:**
  - `PersonalTimeline` — vertical timeline showing decade/age/likely experiences
  - `AiInsightsPanel` — AI-generated personality/cultural insights
  - Sign-in prompt for saving insights
  - Closing message ("You made it through.")
- **Rule:** Timeline and insights only. No browsing, no games, no data management.

### 9. SETTINGS — App Configuration, Account, Data Management Only

- **What belongs:** Everything related to configuring the app, managing the user's account, and managing stored data.
- **Current contents (4 collapsible sections via `SettingsTab`):**
  1. `EraSkins` — theme picker (6 era skins that swap CSS custom properties)
  2. `DataManagementInline` — export backup, import backup, clear all data, storage usage
  3. `AccountSection` — sign in/out, current user display
  4. `AppInfoSection` — version, storage type, LocalDataBadge, app description
- **Entry points:** Tab bar "Settings" button, header gear icon (shortcut), footer "Settings" link (shortcut)
- **Rule:** Configuration only. No content, no games, no nostalgia data.

---

## Assignment Rules

### Rule 1: One Home, No Duplication
Every feature must live in **exactly one** tab. A feature must never be imported or rendered in two different tabs.

### Rule 2: Category Assignment
Before building any new feature, assign it to exactly ONE of the 9 categories above based on the definition list. If a feature doesn't clearly fit one category, that's a signal to either:
- **Redefine the categories** (update this file), or
- **Split the feature** into parts that each belong to one category.

### Rule 3: Never Blur Categories
Never place a feature in two tabs. Never expand a tab's definition to accommodate a feature that doesn't belong. If the Vault starts having primary browsing, that's a blurring error — the browsing belongs in Memories.

### Rule 4: Shortcuts Are Entry Points, Not Duplicates
Header icons, footer links, and FABs are **shortcuts** that navigate to the canonical tab. They must not render their own separate UI — they call `handleTabChange(tabId)` to switch to the tab where the feature lives.

### Rule 5: Overlays Are Only for Reel and Auth
The only acceptable fullscreen overlays are:
- Memory Reel (tab 1) — because it's an immersive feed experience
- Auth Modal — because sign-in/sign-up is a transient action, not a persistent tab

Everything else (EraSkins, ManageData, etc.) lives inline inside its tab.

---

## Feature Count Verification

| # | Feature | Tab | Component |
|---|---------|-----|-----------|
| 1 | Memory Reel Feed | Reel | `MemoryReelFeed` |
| 2 | Breather Messages | Memories | `BreatherMessage` (inline) |
| 3 | Era Spotlight | Memories | `EraSpotlight` (inline) |
| 4 | Category Browser | Memories | `CategoryGrid` (inline) |
| 5 | Journal | Journal | `OldJournal` |
| 6 | Vintage Camera | Camera | `VintageCamera` |
| 7 | Memory Vault | Vault | `MemoryVault` |
| 8 | Throwback Library | Vault | `ThrowbackLibrary` |
| 9 | Era Pods | Vault | `EraPods` |
| 10 | Guestbook | Fun Stuff | `GuestbookSection` |
| 11 | Mixtape Creator | Fun Stuff | `MixtapeSection` |
| 12 | Magic 8-Ball | Fun Stuff | `Magic8BallSection` |
| 13 | Visit Counter | Fun Stuff | `VisitCounterSection` |
| 14 | Tamagotchi | Fun Stuff | `TamagotchiSection` |
| 15 | Floppy Disk Saver | Fun Stuff | `FloppyDiskSection` |
| 16 | Rotary Phone | Fun Stuff | `RotaryPhoneSection` |
| 17 | Sticker Wall | Fun Stuff | `StickerWallSection` |
| 18 | Voice Messages | Fun Stuff | `VoiceMessages` |
| 19 | Retro Chat | Fun Stuff | `RetroChatSection` |
| 20 | Memory Match Game | Games | `MemoryMatchGame` |
| 21 | Guess The Year Game | Games | `GuessTheYearGame` |
| 22 | Tap The Memory Game | Games | `WhackGame` |
| 23 | Personal Timeline | Timeline | `PersonalTimeline` (inline) |
| 24 | AI Insights | Timeline | `AiInsightsPanel` |

**Settings features** (configuration, not content features):
- Era Themes -> `EraSkins`
- Data Management -> `DataManagementInline`
- Account -> `AccountSection`
- App Info -> `AppInfoSection`

**Total: 24 content features + 4 config sections = 28 features, 0 duplications.**
