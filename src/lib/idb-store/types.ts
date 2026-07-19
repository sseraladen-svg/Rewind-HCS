/* ═══════════════════════════════════════════════════
   IndexedDB Record Types
   ═══════════════════════════════════════════════════
   Every record stored in rewind-local-db.
   Field names match what the UI components expect
   so this is a pure storage-layer swap.
   ═══════════════════════════════════════════════════ */

// ─── Journal ───────────────────────────────────────

export interface JournalEntryRecord {
  id: string;
  date: string;        // ISO date string
  title: string;
  body: string;
  mood: string;        // emoji string e.g. '😊'
  weather: string;     // emoji string e.g. '☀️'
  createdAt: number;   // Date.now() timestamp
}

// ─── Camera Photos ────────────────────────────────

export interface CameraPhotoRecord {
  id: string;
  image_blob: Blob;    // raw Blob, NOT base64
  filter_used: string;
  created_at: number;  // Date.now() timestamp
}

// ─── Mixtapes ─────────────────────────────────────

export interface MixtapeRecord {
  id: string;
  to: string;
  from: string;
  side: 'A' | 'B';
  tracks: string[];    // up to 8 track names
  createdAt: string;   // ISO string
}

// ─── Sticker Placements ──────────────────────────

export interface StickerPlacementRecord {
  id: string;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
}

// ─── Guestbook ────────────────────────────────────

export interface GuestbookEntryRecord {
  id: string;
  name: string;
  message: string;
  date: string;        // ISO string
  emoji: string;
}

// ─── Tamagotchi ───────────────────────────────────

export interface TamagotchiStateRecord {
  id: string;          // fixed: 'pet-1'
  hunger: number;      // 0–100
  happiness: number;   // 0–100
  energy: number;      // 0–100
  last_updated: number;
  is_alive: boolean;
}

// ─── Floppy Saves ─────────────────────────────────

export interface FloppySaveRecord {
  id: string;          // fixed: 'counter'
  label: string;
  created_at: number;
}

// ─── Voicemails ───────────────────────────────────

export interface VoicemailRecord {
  id: string;
  audio_blob: Blob;    // raw audio Blob, NOT base64
  duration: number;    // seconds
  timestamp: string;   // ISO string
}

// ─── Chat Messages ────────────────────────────────

export interface ChatMessageRecord {
  id: string;
  from: 'me' | 'buddy';
  text: string;
  time: string;        // "HH:MM AM/PM"
  color: string;       // hex
}

// ─── Memory Vault (favorites by title) ────────────

export interface MemoryVaultRecord {
  id: string;          // fixed: 'vault'
  titles: string[];    // array of item titles
}

// ─── Era Skin ─────────────────────────────────────

export interface EraSkinRecord {
  id: string;          // fixed: 'current'
  skin_id: string;
}

// ─── Library Favorites ────────────────────────────

export interface LibraryFavoritesRecord {
  id: string;          // fixed: 'favorites'
  titles: string[];    // array of item titles
}

// ─── Reel Reactions ───────────────────────────────

export interface ReelReactionRecord {
  id: string;          // fixed: 'reactions'
  reactions: Record<string, string>; // cardKey → reaction type
}

// ─── Reel Reflections ─────────────────────────────

export interface ReelReflectionRecord {
  id: string;          // auto-generated
  sourceId: string;
  reflection: string;
  reflectionMood: string;
}

// ─── Visit Counter ────────────────────────────────

export interface VisitCountRecord {
  id: string;          // fixed: 'count'
  count: number;
}

// ─── All store names ──────────────────────────────

export const DB_STORES = [
  'journal_entries',
  'camera_photos',
  'mixtapes',
  'sticker_placements',
  'guestbook_entries',
  'tamagotchi_state',
  'floppy_saves',
  'voicemails',
  'chat_messages',
  'memory_vault',
  'era_skin',
  'library_favorites',
  'reel_reactions',
  'reel_reflections',
  'visit_count',
] as const;

export type DBStoreName = typeof DB_STORES[number];