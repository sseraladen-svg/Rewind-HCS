/* ═══════════════════════════════════════════════════
   IndexedDB Client — rewind-local-db
   ═══════════════════════════════════════════════════
   Single module that opens the database and exposes
   typed CRUD functions for every object store.
   All operations are async (IndexedDB requirement).
   ═══════════════════════════════════════════════════ */

import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type {
  JournalEntryRecord,
  CameraPhotoRecord,
  MixtapeRecord,
  StickerPlacementRecord,
  GuestbookEntryRecord,
  TamagotchiStateRecord,
  FloppySaveRecord,
  VoicemailRecord,
  ChatMessageRecord,
  MemoryVaultRecord,
  EraSkinRecord,
  LibraryFavoritesRecord,
  ReelReactionRecord,
  ReelReflectionRecord,
  VisitCountRecord,
} from './types';

/* ───── Schema ───── */

interface RewindDB extends DBSchema {
  journal_entries: {
    key: string;
    value: JournalEntryRecord;
    indexes: { 'by-created': number };
  };
  camera_photos: {
    key: string;
    value: CameraPhotoRecord;
    indexes: { 'by-created': number };
  };
  mixtapes: {
    key: string;
    value: MixtapeRecord;
  };
  sticker_placements: {
    key: string;
    value: StickerPlacementRecord;
  };
  guestbook_entries: {
    key: string;
    value: GuestbookEntryRecord;
  };
  tamagotchi_state: {
    key: string;
    value: TamagotchiStateRecord;
  };
  floppy_saves: {
    key: string;
    value: FloppySaveRecord;
  };
  voicemails: {
    key: string;
    value: VoicemailRecord;
    indexes: { 'by-timestamp': string };
  };
  chat_messages: {
    key: string;
    value: ChatMessageRecord;
  };
  memory_vault: {
    key: string;
    value: MemoryVaultRecord;
  };
  era_skin: {
    key: string;
    value: EraSkinRecord;
  };
  library_favorites: {
    key: string;
    value: LibraryFavoritesRecord;
  };
  reel_reactions: {
    key: string;
    value: ReelReactionRecord;
  };
  reel_reflections: {
    key: string;
    value: ReelReflectionRecord;
    indexes: { 'by-sourceId': string };
  };
  visit_count: {
    key: string;
    value: VisitCountRecord;
  };
}

/* ───── Database singleton ───── */

const DB_NAME = 'rewind-local-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RewindDB>> | null = null;

function getDB(): Promise<IDBPDatabase<RewindDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RewindDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Journal entries
        if (!db.objectStoreNames.contains('journal_entries')) {
          const journal = db.createObjectStore('journal_entries', { keyPath: 'id' });
          journal.createIndex('by-created', 'createdAt');
        }
        // Camera photos
        if (!db.objectStoreNames.contains('camera_photos')) {
          const photos = db.createObjectStore('camera_photos', { keyPath: 'id' });
          photos.createIndex('by-created', 'created_at');
        }
        // Mixtapes
        if (!db.objectStoreNames.contains('mixtapes')) {
          db.createObjectStore('mixtapes', { keyPath: 'id' });
        }
        // Sticker placements
        if (!db.objectStoreNames.contains('sticker_placements')) {
          db.createObjectStore('sticker_placements', { keyPath: 'id' });
        }
        // Guestbook entries
        if (!db.objectStoreNames.contains('guestbook_entries')) {
          db.createObjectStore('guestbook_entries', { keyPath: 'id' });
        }
        // Tamagotchi state
        if (!db.objectStoreNames.contains('tamagotchi_state')) {
          db.createObjectStore('tamagotchi_state', { keyPath: 'id' });
        }
        // Floppy saves
        if (!db.objectStoreNames.contains('floppy_saves')) {
          db.createObjectStore('floppy_saves', { keyPath: 'id' });
        }
        // Voicemails
        if (!db.objectStoreNames.contains('voicemails')) {
          const vm = db.createObjectStore('voicemails', { keyPath: 'id' });
          vm.createIndex('by-timestamp', 'timestamp');
        }
        // Chat messages
        if (!db.objectStoreNames.contains('chat_messages')) {
          db.createObjectStore('chat_messages', { keyPath: 'id' });
        }
        // Memory vault
        if (!db.objectStoreNames.contains('memory_vault')) {
          db.createObjectStore('memory_vault', { keyPath: 'id' });
        }
        // Era skin
        if (!db.objectStoreNames.contains('era_skin')) {
          db.createObjectStore('era_skin', { keyPath: 'id' });
        }
        // Library favorites
        if (!db.objectStoreNames.contains('library_favorites')) {
          db.createObjectStore('library_favorites', { keyPath: 'id' });
        }
        // Reel reactions
        if (!db.objectStoreNames.contains('reel_reactions')) {
          db.createObjectStore('reel_reactions', { keyPath: 'id' });
        }
        // Reel reflections
        if (!db.objectStoreNames.contains('reel_reflections')) {
          const rr = db.createObjectStore('reel_reflections', { keyPath: 'id' });
          rr.createIndex('by-sourceId', 'sourceId');
        }
        // Visit count
        if (!db.objectStoreNames.contains('visit_count')) {
          db.createObjectStore('visit_count', { keyPath: 'id' });
        }
      },
      blocked() {
        console.warn('[rewind-db] Database upgrade blocked — close other tabs');
      },
      blocking() {
        console.warn('[rewind-db] This connection is blocking an upgrade');
      },
    });
  }
  return dbPromise;
}

/* ═══════════════════════════════════════════════════
   Journal Entries
   ═══════════════════════════════════════════════════ */

export async function getAllJournalEntries(): Promise<JournalEntryRecord[]> {
  const db = await getDB();
  return db.getAll('journal_entries');
}

export async function addJournalEntry(entry: JournalEntryRecord): Promise<void> {
  const db = await getDB();
  await db.add('journal_entries', entry);
}

export async function putJournalEntry(entry: JournalEntryRecord): Promise<void> {
  const db = await getDB();
  await db.put('journal_entries', entry);
}

export async function updateJournalEntry(id: string, changes: Partial<JournalEntryRecord>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('journal_entries', 'readwrite');
  const entry = await tx.store.get(id);
  if (entry) {
    await tx.store.put({ ...entry, ...changes });
  }
  await tx.done;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('journal_entries', id);
}

export async function clearJournalEntries(): Promise<void> {
  const db = await getDB();
  await db.clear('journal_entries');
}

/* ═══════════════════════════════════════════════════
   Camera Photos
   ═══════════════════════════════════════════════════ */

export async function getAllCameraPhotos(): Promise<CameraPhotoRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('camera_photos', 'by-created');
}

export async function addCameraPhoto(photo: CameraPhotoRecord): Promise<void> {
  const db = await getDB();
  await db.add('camera_photos', photo);
}

export async function deleteCameraPhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('camera_photos', id);
}

export async function clearCameraPhotos(): Promise<void> {
  const db = await getDB();
  await db.clear('camera_photos');
}

/* ═══════════════════════════════════════════════════
   Mixtapes
   ═══════════════════════════════════════════════════ */

export async function getAllMixtapes(): Promise<MixtapeRecord[]> {
  const db = await getDB();
  return db.getAll('mixtapes');
}

export async function addMixtape(mixtape: MixtapeRecord): Promise<void> {
  const db = await getDB();
  await db.add('mixtapes', mixtape);
}

export async function deleteMixtape(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('mixtapes', id);
}

export async function clearMixtapes(): Promise<void> {
  const db = await getDB();
  await db.clear('mixtapes');
}

/* ═══════════════════════════════════════════════════
   Sticker Placements
   ═══════════════════════════════════════════════════ */

export async function getAllStickers(): Promise<StickerPlacementRecord[]> {
  const db = await getDB();
  return db.getAll('sticker_placements');
}

export async function addSticker(sticker: StickerPlacementRecord): Promise<void> {
  const db = await getDB();
  await db.add('sticker_placements', sticker);
}

export async function putAllStickers(stickers: StickerPlacementRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sticker_placements', 'readwrite');
  await tx.store.clear();
  for (const s of stickers) {
    await tx.store.put(s);
  }
  await tx.done;
}

export async function clearStickers(): Promise<void> {
  const db = await getDB();
  await db.clear('sticker_placements');
}

/* ═══════════════════════════════════════════════════
   Guestbook Entries
   ═══════════════════════════════════════════════════ */

export async function getAllGuestbookEntries(): Promise<GuestbookEntryRecord[]> {
  const db = await getDB();
  return db.getAll('guestbook_entries');
}

export async function addGuestbookEntry(entry: GuestbookEntryRecord): Promise<void> {
  const db = await getDB();
  await db.add('guestbook_entries', entry);
}

export async function putAllGuestbookEntries(entries: GuestbookEntryRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('guestbook_entries', 'readwrite');
  await tx.store.clear();
  for (const e of entries) {
    await tx.store.put(e);
  }
  await tx.done;
}

export async function clearGuestbookEntries(): Promise<void> {
  const db = await getDB();
  await db.clear('guestbook_entries');
}

/* ═══════════════════════════════════════════════════
   Tamagotchi State
   ═══════════════════════════════════════════════════ */

const PET_ID = 'pet-1';

export async function getTamagotchiState(): Promise<TamagotchiStateRecord | undefined> {
  const db = await getDB();
  return db.get('tamagotchi_state', PET_ID);
}

export async function saveTamagotchiState(state: TamagotchiStateRecord): Promise<void> {
  const db = await getDB();
  await db.put('tamagotchi_state', { ...state, id: PET_ID });
}

export async function clearTamagotchiState(): Promise<void> {
  const db = await getDB();
  await db.delete('tamagotchi_state', PET_ID);
}

/* ═══════════════════════════════════════════════════
   Floppy Saves
   ═══════════════════════════════════════════════════ */

const FLOPPY_ID = 'counter';

export async function getFloppyCount(): Promise<number> {
  const db = await getDB();
  const record = await db.get('floppy_saves', FLOPPY_ID);
  const records = await db.getAll('floppy_saves');
  return records.length;
}

export async function addFloppySave(label: string): Promise<void> {
  const db = await getDB();
  await db.add('floppy_saves', {
    id: `${FLOPPY_ID}-${Date.now()}`,
    label,
    created_at: Date.now(),
  });
}

export async function getFloppySavesCount(): Promise<number> {
  const db = await getDB();
  return (await db.getAll('floppy_saves')).length;
}

export async function clearFloppySaves(): Promise<void> {
  const db = await getDB();
  await db.clear('floppy_saves');
}

/* ═══════════════════════════════════════════════════
   Voicemails
   ═══════════════════════════════════════════════════ */

export async function getAllVoicemails(): Promise<VoicemailRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('voicemails', 'by-timestamp');
}

export async function addVoicemail(vm: VoicemailRecord): Promise<void> {
  const db = await getDB();
  await db.add('voicemails', vm);
}

export async function deleteVoicemail(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('voicemails', id);
}

export async function clearVoicemails(): Promise<void> {
  const db = await getDB();
  await db.clear('voicemails');
}

/* ═══════════════════════════════════════════════════
   Chat Messages
   ═══════════════════════════════════════════════════ */

export async function getAllChatMessages(): Promise<ChatMessageRecord[]> {
  const db = await getDB();
  return db.getAll('chat_messages');
}

export async function addChatMessage(msg: ChatMessageRecord): Promise<void> {
  const db = await getDB();
  await db.add('chat_messages', msg);
}

export async function putAllChatMessages(msgs: ChatMessageRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('chat_messages', 'readwrite');
  await tx.store.clear();
  for (const m of msgs) {
    await tx.store.put(m);
  }
  await tx.done;
}

export async function clearChatMessages(): Promise<void> {
  const db = await getDB();
  await db.clear('chat_messages');
}

/* ═══════════════════════════════════════════════════
   Memory Vault (single record with titles array)
   ═══════════════════════════════════════════════════ */

const VAULT_ID = 'vault';

export async function getMemoryVaultTitles(): Promise<string[]> {
  const db = await getDB();
  const record = await db.get('memory_vault', VAULT_ID);
  return record?.titles ?? [];
}

export async function setMemoryVaultTitles(titles: string[]): Promise<void> {
  const db = await getDB();
  await db.put('memory_vault', { id: VAULT_ID, titles });
}

export async function clearMemoryVault(): Promise<void> {
  const db = await getDB();
  await db.delete('memory_vault', VAULT_ID);
}

/* ═══════════════════════════════════════════════════
   Era Skin (single record)
   ═══════════════════════════════════════════════════ */

const SKIN_ID = 'current';

export async function getEraSkinId(): Promise<string | null> {
  const db = await getDB();
  const record = await db.get('era_skin', SKIN_ID);
  return record?.skin_id ?? null;
}

export async function setEraSkinId(skinId: string): Promise<void> {
  const db = await getDB();
  await db.put('era_skin', { id: SKIN_ID, skin_id: skinId });
}

export async function clearEraSkin(): Promise<void> {
  const db = await getDB();
  await db.delete('era_skin', SKIN_ID);
}

/* ═══════════════════════════════════════════════════
   Library Favorites (single record with titles array)
   ═══════════════════════════════════════════════════ */

const FAVS_ID = 'favorites';

export async function getLibraryFavorites(): Promise<string[]> {
  const db = await getDB();
  const record = await db.get('library_favorites', FAVS_ID);
  return record?.titles ?? [];
}

export async function setLibraryFavorites(titles: string[]): Promise<void> {
  const db = await getDB();
  await db.put('library_favorites', { id: FAVS_ID, titles });
}

export async function clearLibraryFavorites(): Promise<void> {
  const db = await getDB();
  await db.delete('library_favorites', FAVS_ID);
}

/* ═══════════════════════════════════════════════════
   Reel Reactions (single record)
   ═══════════════════════════════════════════════════ */

const REACTIONS_ID = 'reactions';

export async function getReelReactions(): Promise<Record<string, string>> {
  const db = await getDB();
  const record = await db.get('reel_reactions', REACTIONS_ID);
  return record?.reactions ?? {};
}

export async function setReelReaction(cardKey: string, reaction: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('reel_reactions', 'readwrite');
  const record = await tx.store.get(REACTIONS_ID);
  const reactions = record?.reactions ?? {};
  if (reaction) {
    reactions[cardKey] = reaction;
  } else {
    delete reactions[cardKey];
  }
  await tx.store.put({ id: REACTIONS_ID, reactions });
  await tx.done;
}

export async function clearReelReactions(): Promise<void> {
  const db = await getDB();
  await db.delete('reel_reactions', REACTIONS_ID);
}

/* ═══════════════════════════════════════════════════
   Reel Reflections
   ═══════════════════════════════════════════════════ */

export async function getAllReelReflections(): Promise<ReelReflectionRecord[]> {
  const db = await getDB();
  return db.getAll('reel_reflections');
}

export async function getReelReflection(sourceId: string): Promise<ReelReflectionRecord | undefined> {
  const db = await getDB();
  const idx = db.transaction('reel_reflections').store.index('by-sourceId');
  return idx.get(sourceId);
}

export async function upsertReelReflection(ref: ReelReflectionRecord): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('reel_reflections', 'readwrite');
  const idx = tx.store.index('by-sourceId');
  const existing = await idx.get(ref.sourceId);
  if (existing) {
    await tx.store.put({ ...existing, reflection: ref.reflection, reflectionMood: ref.reflectionMood });
  } else {
    await tx.store.put(ref);
  }
  await tx.done;
}

export async function clearReelReflections(): Promise<void> {
  const db = await getDB();
  await db.clear('reel_reflections');
}

/* ═══════════════════════════════════════════════════
   Visit Counter
   ═══════════════════════════════════════════════════ */

const VISIT_ID = 'count';

export async function getVisitCount(): Promise<number> {
  const db = await getDB();
  const record = await db.get('visit_count', VISIT_ID);
  return record?.count ?? 0;
}

export async function incrementVisitCount(): Promise<number> {
  const db = await getDB();
  const tx = db.transaction('visit_count', 'readwrite');
  const record = await tx.store.get(VISIT_ID);
  const newCount = (record?.count ?? 0) + 1;
  await tx.store.put({ id: VISIT_ID, count: newCount });
  await tx.done;
  return newCount;
}

export async function clearVisitCount(): Promise<void> {
  const db = await getDB();
  await db.delete('visit_count', VISIT_ID);
}

/* ═══════════════════════════════════════════════════
   Bulk Operations (for export/import/clear)
   ═══════════════════════════════════════════════════ */

export async function clearAllStores(): Promise<void> {
  const db = await getDB();
  const storeNames = Array.from(db.objectStoreNames);
  const tx = db.transaction(storeNames, 'readwrite');
  for (const name of storeNames) {
    tx.objectStore(name).clear();
  }
  await tx.done;
}

export type ExportData = {
  journal_entries: JournalEntryRecord[];
  camera_photos_count: number; // photos exported without blobs (too large for JSON)
  mixtapes: MixtapeRecord[];
  sticker_placements: StickerPlacementRecord[];
  guestbook_entries: GuestbookEntryRecord[];
  tamagotchi_state: TamagotchiStateRecord | null;
  floppy_saves_count: number;
  voicemails_count: number; // audio exported without blobs
  chat_messages: ChatMessageRecord[];
  memory_vault: string[];
  era_skin: string | null;
  library_favorites: string[];
  reel_reactions: Record<string, string>;
  reel_reflections: ReelReflectionRecord[];
  visit_count: number;
  exported_at: string;
  version: number;
};

export async function exportAllData(): Promise<ExportData> {
  const [
    journal,
    photos,
    mixtapes,
    stickers,
    guestbook,
    tamagotchi,
    floppySaves,
    voicemails,
    chatMsgs,
    vaultTitles,
    skinId,
    libFavs,
    reelReactions,
    reelReflections,
    visitCount,
  ] = await Promise.all([
    getAllJournalEntries(),
    getAllCameraPhotos(),
    getAllMixtapes(),
    getAllStickers(),
    getAllGuestbookEntries(),
    getTamagotchiState(),
    getFloppySavesCount(),
    getAllVoicemails(),
    getAllChatMessages(),
    getMemoryVaultTitles(),
    getEraSkinId(),
    getLibraryFavorites(),
    getReelReactions(),
    getAllReelReflections(),
    getVisitCount(),
  ]);

  return {
    journal_entries: journal,
    camera_photos_count: photos.length,
    mixtapes,
    sticker_placements: stickers,
    guestbook_entries: guestbook,
    tamagotchi_state: tamagotchi ?? null,
    floppy_saves_count: floppySaves,
    voicemails_count: voicemails.length,
    chat_messages: chatMsgs,
    memory_vault: vaultTitles,
    era_skin: skinId,
    library_favorites: libFavs,
    reel_reactions: reelReactions,
    reel_reflections: reelReflections,
    visit_count: visitCount,
    exported_at: new Date().toISOString(),
    version: 1,
  };
}