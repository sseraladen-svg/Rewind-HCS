'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getDB } from '@/lib/idb-store';

interface UseSyncReturn {
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSynced: Date | null;
  syncNow: () => Promise<void>;
  syncStore: (storeName: string) => Promise<void>;
}

const SYNCABLE_STORES = [
  'journal_entries',
  'camera_photos',
  'era_skin',
  'chat_messages',
  'voicemails',
] as const;

type SyncableStore = (typeof SYNCABLE_STORES)[number];

/**
 * Strip blob fields from records that cannot be serialized.
 * For camera_photos: drop image_blob.
 * For voicemails: drop audio_blob.
 */
function stripBlobs(storeName: string, records: Record<string, unknown>[]): Record<string, unknown>[] {
  if (storeName === 'camera_photos') {
    return records.map(r => {
      const { image_blob, ...rest } = r;
      return rest;
    });
  }
  if (storeName === 'voicemails') {
    return records.map(r => {
      const { audio_blob, ...rest } = r;
      return rest;
    });
  }
  return records;
}

export function useSync(): UseSyncReturn {
  const { data: session } = useSession();
  const [syncStatus, setSyncStatus] = useState<UseSyncReturn['syncStatus']>('idle');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const syncingRef = useRef(false);
  const syncedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncStore = useCallback(async (storeName: string) => {
    if (!session?.user?.id) return;

    const database = await getDB();
    const tx = (database as any).transaction(storeName, 'readonly');
    let localRecords: Record<string, unknown>[];

    try {
      const allRecords: any[] = await tx.store.getAll();
      localRecords = allRecords as Record<string, unknown>[];
    } catch {
      await tx.done;
      return;
    }
    await tx.done;

    // Strip non-serializable blob fields
    const cleanRecords = stripBlobs(storeName, localRecords);

    // Push local → server
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push', store: storeName, records: cleanRecords }),
      });
    } catch (err) {
      console.error(`[useSync] Push failed for ${storeName}:`, err);
      throw err;
    }

    // Pull server → local
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pull', store: storeName }),
      });

      if (!res.ok) throw new Error(`Pull failed for ${storeName}`);

      const { records: serverRecords } = (await res.json()) as { records: Record<string, unknown>[] };

      if (!serverRecords || serverRecords.length === 0) return;

      // Merge server records into IndexedDB (upsert behavior)
      const writeTx = (database as any).transaction(storeName, 'readwrite');
      for (const record of serverRecords) {
        // Check if local already has a newer version (for stores with timestamps)
        const local: any = await writeTx.store.get(record.id as string);
        if (!local) {
          // Server has it, local doesn't → pull it down
          // Skip records that had blobs stripped (they'd be incomplete)
          if (storeName === 'camera_photos' && !(record as any).image_blob) continue;
          if (storeName === 'voicemails' && !(record as any).audio_blob) continue;
          await writeTx.store.put(record as any);
        }
      }
      await writeTx.done;
    } catch (err) {
      console.error(`[useSync] Pull failed for ${storeName}:`, err);
      throw err;
    }
  }, [session?.user?.id]);

  const syncNow = useCallback(async () => {
    if (!session?.user?.id || syncingRef.current) return;
    syncingRef.current = true;
    setSyncStatus('syncing');

    // Clear any previous "synced" timer
    if (syncedTimerRef.current) {
      clearTimeout(syncedTimerRef.current);
      syncedTimerRef.current = null;
    }

    try {
      for (const store of SYNCABLE_STORES) {
        await syncStore(store);
      }
      setSyncStatus('synced');
      setLastSynced(new Date());

      // Reset to idle after 3 seconds
      syncedTimerRef.current = setTimeout(() => {
        setSyncStatus('idle');
        syncedTimerRef.current = null;
      }, 3000);
    } catch {
      setSyncStatus('error');
      syncedTimerRef.current = setTimeout(() => {
        setSyncStatus('idle');
        syncedTimerRef.current = null;
      }, 4000);
    } finally {
      syncingRef.current = false;
    }
  }, [session?.user?.id, syncStore]);

  // Auto-sync on mount if authenticated (with a small delay)
  useEffect(() => {
    if (session?.user?.id) {
      const timer = setTimeout(() => {
        syncNow();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session?.user?.id, syncNow]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (syncedTimerRef.current) {
        clearTimeout(syncedTimerRef.current);
      }
    };
  }, []);

  if (!session?.user?.id) {
    return { syncStatus: 'idle', lastSynced: null, syncNow: async () => {}, syncStore: async () => {} };
  }

  return { syncStatus, lastSynced, syncNow, syncStore };
}
