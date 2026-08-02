/* ═══════════════════════════════════════════════════
   Memory Reel — Type Definitions
   ═══════════════════════════════════════════════════ */

export type FeedCard =
  | MemoryCardData
  | ThenVsNowCardData
  | GrowthSignalCardData
  | DiscoveryCardData
  | EndCardData;

export interface MemoryCardData {
  type: 'memory';
  sourceId: string;
  sourceType: 'journal' | 'camera' | 'mixtape' | 'sticker';
  mood?: string;           // emoji string from MOODS
  date: string;            // ISO date string
  /** "X days ago" / "X months ago" / "X years ago" */
  agoLabel: string;
  /** Content preview — journal title, mixtape track, sticker emoji cluster */
  title: string;
  /** Longer body for journal entries */
  body?: string;
  /** Photo data URL (camera) */
  photoUrl?: string;
  /** Weather emoji (journal only) */
  weather?: string;
}

export interface ThenVsNowCardData {
  type: 'then_vs_now';
  sourceId: string;
  sourceType: 'journal' | 'camera';
  /** The original memory content */
  thenTitle: string;
  thenBody?: string;
  thenPhotoUrl?: string;
  thenDate: string;
  thenAgoLabel: string;
  /** User reflection saved here */
  reflection?: string;
  reflectionMood?: string;
}

export interface GrowthSignalCardData {
  type: 'growth';
  signalType: 'streak' | 'milestone' | 'activity';
  message: string;
  /** Optional sub-detail */
  detail?: string;
}

export interface DiscoveryCardData {
  type: 'discovery';
  format: 'trivia' | 'fact' | 'song' | 'minigame';
  entryId: string;
  title: string;
  description: string;
  emoji: string;
  /** For trivia: the question and options */
  triviaQuestion?: string;
  triviaOptions?: string[];
  triviaCorrect?: number;
}

export interface EndCardData {
  type: 'end';
}

/** Reaction types — warm, non-comparative */
export type ReactionType = 'candle' | 'hug' | 'heart-hands' | 'me-too';

export const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: 'candle',      emoji: '🕯️' },
  { type: 'hug',         emoji: '🫂' },
  { type: 'heart-hands', emoji: '🫶' },
  { type: 'me-too',      emoji: '💡' },
];

/** Stored reaction per card */
export interface CardReaction {
  cardSourceId: string;
  reaction: ReactionType;
}

/** Re-exported moods for convenience */
export const MOODS = [
  { id: 'happy',     emoji: '😊', label: 'Happy' },
  { id: 'nostalgic', emoji: '🥺', label: 'Nostalgic' },
  { id: 'peaceful',  emoji: '😌', label: 'Peaceful' },
  { id: 'excited',   emoji: '🤩', label: 'Excited' },
  { id: 'thoughtful',emoji: '🤔', label: 'Thoughtful' },
  { id: 'sad',       emoji: '😢', label: 'Sad' },
  { id: 'grateful',  emoji: '🙏', label: 'Grateful' },
  { id: 'love',      emoji: '❤️', label: 'Love' },
] as const;