/* ═══════════════════════════════════════════════════
   Memory Reel — Feed Generation
   ═══════════════════════════════════════════════════
   Reads from existing localStorage stores and the
   nostalgia-data JSON. Returns a deterministic,
   ordered FeedCard[].
   ═══════════════════════════════════════════════════ */

import {
  nostalgiaData,
  getDecadeForYear,
  type DecadeData,
  type NostalgiaItem,
} from '@/lib/nostalgia-data';
import type {
  FeedCard,
  MemoryCardData,
  ThenVsNowCardData,
  GrowthSignalCardData,
  DiscoveryCardData,
  EndCardData,
} from './types';

/* ───── Helpers ───── */

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function loadJSON<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, data: unknown) {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* quota or security error */ }
}

function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  if (years > 0) return years === 1 ? '1 year ago' : `${years} years ago`;
  if (months > 0) return months === 1 ? '1 month ago' : `${months} months ago`;
  if (days > 0) return days === 1 ? '1 day ago' : `${days} days ago`;
  if (hours > 0) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  return 'just now';
}

/** Simple deterministic hash for shuffling */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* ───── Source Data Interfaces (mirror existing stores) ───── */

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  body: string;
  mood: string;
  weather: string;
  createdAt: number;
}

interface Mixtape {
  id: string;
  to: string;
  from: string;
  side: 'A' | 'B';
  tracks: string[];
  createdAt: string;
}

interface PlacedSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
}

interface ThenVsNowReflection {
  sourceId: string;
  reflection: string;
  reflectionMood: string;
}

/* ───── Data Loaders ───── */

function loadJournalEntries(): JournalEntry[] {
  return loadJSON<JournalEntry[]>('rewind_journal_entries', []);
}

function loadMixtapes(): Mixtape[] {
  return loadJSON<Mixtape[]>('rewind_mixtapes', []);
}

function loadStickers(): PlacedSticker[] {
  return loadJSON<PlacedSticker[]>('rewind_sticker_wall', []);
}

function loadReflections(): ThenVsNowReflection[] {
  return loadJSON<ThenVsNowReflection[]>('rewind_reel_reflections', []);
}

function saveReflection(r: ThenVsNowReflection) {
  const existing = loadReflections();
  const idx = existing.findIndex(e => e.sourceId === r.sourceId);
  if (idx >= 0) existing[idx] = r;
  else existing.push(r);
  saveJSON('rewind_reel_reflections', existing);
}

/* ───── Card Builders ───── */

function buildMemoryCards(): MemoryCardData[] {
  const cards: MemoryCardData[] = [];

  // Journal entries
  const journals = loadJournalEntries()
    .sort((a, b) => b.createdAt - a.createdAt);

  for (const j of journals) {
    cards.push({
      type: 'memory',
      sourceId: j.id,
      sourceType: 'journal',
      mood: j.mood || undefined,
      date: j.date,
      agoLabel: timeAgo(j.date),
      title: j.title,
      body: j.body,
      weather: j.weather || undefined,
    });
  }

  // Mixtapes — each track becomes a card
  const mixtapes = loadMixtapes()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  for (const m of mixtapes) {
    for (let i = 0; i < m.tracks.length; i++) {
      const track = m.tracks[i];
      if (!track.trim()) continue;
      cards.push({
        type: 'memory',
        sourceId: `${m.id}__track_${i}`,
        sourceType: 'mixtape',
        date: m.createdAt,
        agoLabel: timeAgo(m.createdAt),
        title: track.trim(),
        body: `Side ${m.side} — "${m.to}" by ${m.from}`,
      });
    }
  }

  // Stickers — group into clusters of 3–5 for a card
  const stickers = loadStickers();
  if (stickers.length > 0) {
    // Create 1–2 sticker cards, each showing a cluster
    const clusterSize = Math.min(5, Math.max(3, Math.ceil(stickers.length / 2)));
    const clusters: PlacedSticker[][] = [];
    for (let i = 0; i < stickers.length; i += clusterSize) {
      clusters.push(stickers.slice(i, i + clusterSize));
    }
    for (const cluster of clusters) {
      cards.push({
        type: 'memory',
        sourceId: `sticker_cluster_${cluster[0].id}`,
        sourceType: 'sticker',
        date: new Date().toISOString(), // no real date
        agoLabel: 'from your wall',
        title: cluster.map(s => s.emoji).join(' '),
      });
    }
  }

  // Camera photos — NOT in localStorage (session only), skip for now
  // If later persisted, add here.

  return cards;
}

function buildThenVsNowCards(): ThenVsNowCardData[] {
  const journals = loadJournalEntries()
    .sort((a, b) => b.createdAt - a.createdAt);
  const reflections = loadReflections();

  // Take every 4th journal entry (deterministic spacing)
  const cards: ThenVsNowCardData[] = [];
  for (let i = 0; i < journals.length; i += 4) {
    const j = journals[i];
    const ref = reflections.find(r => r.sourceId === j.id);
    cards.push({
      type: 'then_vs_now',
      sourceId: j.id,
      sourceType: 'journal',
      thenTitle: j.title,
      thenBody: j.body,
      thenDate: j.date,
      thenAgoLabel: timeAgo(j.date),
      reflection: ref?.reflection,
      reflectionMood: ref?.reflectionMood,
    });
  }

  return cards;
}

function buildGrowthSignals(birthYear: number): GrowthSignalCardData[] {
  const signals: GrowthSignalCardData[] = [];
  const journals = loadJournalEntries()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // --- Mood streaks: 3+ consecutive positive moods ---
  const positiveMoods = ['😊', '😌', '🤩', '🙏', '❤️'];
  let streak = 0;
  let streakStart = '';
  for (const j of journals) {
    if (positiveMoods.includes(j.mood)) {
      if (streak === 0) streakStart = j.date;
      streak++;
    } else {
      if (streak >= 3) {
        signals.push({
          type: 'growth',
          signalType: 'streak',
          message: `${streak} positive entries in a row`,
          detail: `From ${new Date(streakStart).toLocaleDateString()} — you were on a roll.`,
        });
      }
      streak = 0;
    }
  }
  if (streak >= 3) {
    signals.push({
      type: 'growth',
      signalType: 'streak',
      message: `${streak} positive entries in a row`,
      detail: 'And counting — keep going!',
    });
  }

  // --- Activity streaks: consecutive days with entries ---
  if (journals.length > 0) {
    const daySet = new Set<string>();
    for (const j of journals) {
      daySet.add(j.date.slice(0, 10)); // YYYY-MM-DD
    }
    const sortedDays = Array.from(daySet).sort();
    let activityStreak = 1;
    let maxActivityStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]).getTime();
      const curr = new Date(sortedDays[i]).getTime();
      const diffDays = Math.round((curr - prev) / 86400000);
      if (diffDays === 1) {
        activityStreak++;
        maxActivityStreak = Math.max(maxActivityStreak, activityStreak);
      } else {
        activityStreak = 1;
      }
    }
    if (maxActivityStreak >= 3) {
      signals.push({
        type: 'growth',
        signalType: 'activity',
        message: `You've checked in ${maxActivityStreak} days running`,
        detail: 'Consistency is its own kind of courage.',
      });
    }
  }

  // --- Milestones: entries that are ~1 year old ---
  const oneYearAgo = Date.now() - 365.25 * 86400000;
  for (const j of journals) {
    const created = new Date(j.date).getTime();
    const ageMs = Date.now() - created;
    const ageDays = ageMs / 86400000;
    // Within ~5 days of a year anniversary
    if (ageDays >= 360 && ageDays <= 375) {
      signals.push({
        type: 'growth',
        signalType: 'milestone',
        message: `One year since "${j.title}"`,
        detail: `You wrote this on ${new Date(j.date).toLocaleDateString()}. Look how far you've come.`,
      });
    }
  }

  // --- Total entries milestone ---
  if (journals.length >= 10) {
    signals.push({
      type: 'growth',
      signalType: 'milestone',
      message: `${journals.length} journal entries and counting`,
      detail: 'Every word is a seed you planted for your future self.',
    });
  }

  return signals;
}

function buildDiscoveryCards(birthYear: number): DiscoveryCardData[] {
  const decadeKey = getDecadeForYear(birthYear);
  const decadeData = nostalgiaData[decadeKey];
  if (!decadeData) return [];

  const cards: DiscoveryCardData[] = [];
  const seed = birthYear; // deterministic

  // Collect all items from all categories
  const allItems: (NostalgiaItem & { category: string })[] = [];
  const categories = ['cartoons', 'toys', 'music', 'movies', 'snacks', 'games', 'trends', 'schoolLife', 'tech'] as const;
  for (const cat of categories) {
    for (const item of decadeData[cat]) {
      allItems.push({ ...item, category: cat });
    }
  }

  // --- Song suggestions (from music category) ---
  const musicItems = allItems.filter(i => i.category === 'music');
  for (let i = 0; i < Math.min(3, musicItems.length); i++) {
    const item = musicItems[(seed + i * 7) % musicItems.length];
    cards.push({
      type: 'discovery',
      format: 'song',
      entryId: `song_${i}`,
      title: item.title,
      description: item.description,
      emoji: item.emoji,
    });
  }

  // --- Trivia questions (use items to build "did you know" style) ---
  const triviaPool = allItems.filter(i => i.description.length > 30);
  for (let i = 0; i < Math.min(2, triviaPool.length); i++) {
    const item = triviaPool[(seed + i * 13 + 5) % triviaPool.length];
    cards.push({
      type: 'discovery',
      format: 'trivia',
      entryId: `trivia_${i}`,
      title: `Did you remember?`,
      description: item.description,
      emoji: item.emoji,
      triviaQuestion: `Which ${item.category} icon defined the ${decadeData.decade}?`,
      triviaOptions: [
        item.title,
        // Two wrong answers from the same category
        ...triviaPool
          .filter(t => t.category === item.category && t.title !== item.title)
          .slice(0, 2)
          .map(t => t.title),
        `${item.category} classic`,
      ],
      triviaCorrect: 0,
    });
  }

  // --- "On this day" nostalgia facts ---
  const factPool = allItems.filter(i => i.category === 'trends' || i.category === 'tech');
  for (let i = 0; i < Math.min(2, factPool.length); i++) {
    const item = factPool[(seed + i * 11 + 3) % factPool.length];
    cards.push({
      type: 'discovery',
      format: 'fact',
      entryId: `fact_${i}`,
      title: `From the ${decadeData.decade}`,
      description: item.description,
      emoji: item.emoji,
    });
  }

  // --- Mini-game card (trivia as inline game) ---
  if (triviaPool.length > 3) {
    const item = triviaPool[(seed + 17) % triviaPool.length];
    const wrongItems = triviaPool.filter(t => t.title !== item.title).slice(0, 3);
    cards.push({
      type: 'discovery',
      format: 'minigame',
      entryId: `minigame_0`,
      title: `Quick Round: Guess the ${item.category}`,
      description: item.description,
      emoji: item.emoji,
      triviaQuestion: `What was this?`,
      triviaOptions: [
        item.title,
        ...wrongItems.map(w => w.title),
      ],
      triviaCorrect: 0,
    });
  }

  return cards;
}

/* ───── Feed Assembly ───── */

/**
 * UserData — all the context needed to generate a feed.
 * Designed so it can later be replaced by a Supabase fetch.
 */
export interface UserData {
  birthYear: number;
}

/**
 * Generates a deterministic, ordered feed of cards.
 * Ratio: 3 personal cards (memory/then-vs-now/growth) : 1 discovery card
 */
export function generateFeed(userData: UserData): FeedCard[] {
  const { birthYear } = userData;

  // Build pools
  const memories = buildMemoryCards();
  const thenVsNows = buildThenVsNowCards();
  const growths = buildGrowthSignals(birthYear);
  const discoveries = buildDiscoveryCards(birthYear);

  // Interleave personal cards: memory, then-vs-now, growth (skip empty pools)
  const personalPool: FeedCard[] = [];

  // Round-robin: take one from each pool until all exhausted
  const poolPointers = [0, 0, 0];
  const pools: FeedCard[][] = [memories, thenVsNows, growths];
  let hasMore = true;
  while (hasMore) {
    hasMore = false;
    for (let p = 0; p < pools.length; p++) {
      if (poolPointers[p] < pools[p].length) {
        personalPool.push(pools[p][poolPointers[p]]);
        poolPointers[p]++;
        hasMore = true;
      }
    }
  }

  // If no personal content at all, still show discoveries
  if (personalPool.length === 0 && discoveries.length === 0) {
    return [{ type: 'end' } as EndCardData];
  }

  // Build final feed with 3:1 ratio
  const feed: FeedCard[] = [];
  const discoveryPointer = { v: 0 };
  let personalIndex = 0;

  while (personalIndex < personalPool.length) {
    // Add up to 3 personal cards
    const batchSize = Math.min(3, personalPool.length - personalIndex);
    for (let i = 0; i < batchSize; i++) {
      feed.push(personalPool[personalIndex]);
      personalIndex++;
    }

    // Add 1 discovery card if available
    if (discoveryPointer.v < discoveries.length) {
      feed.push(discoveries[discoveryPointer.v]);
      discoveryPointer.v++;
    }
  }

  // Append any remaining discovery cards
  while (discoveryPointer.v < discoveries.length) {
    feed.push(discoveries[discoveryPointer.v]);
    discoveryPointer.v++;
  }

  // End card
  feed.push({ type: 'end' } as EndCardData);

  return feed;
}

/* ───── Reflection persistence (called from card) ───── */

export function saveThenVsNowReflection(
  sourceId: string,
  reflection: string,
  reflectionMood: string,
) {
  saveReflection({ sourceId, reflection, reflectionMood });
}

export function saveMoodTag(sourceId: string, sourceType: string, mood: string) {
  if (sourceType === 'journal') {
    const entries = loadJournalEntries();
    const idx = entries.findIndex(e => e.id === sourceId);
    if (idx >= 0) {
      entries[idx].mood = mood;
      saveJSON('rewind_journal_entries', entries);
    }
  }
}