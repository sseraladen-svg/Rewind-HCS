/* ═══════════════════════════════════════════════════
   useDBState — Async-first state backed by IndexedDB
   ═══════════════════════════════════════════════════
   Replaces the old useStoredState (localStorage).
   Loads from IndexedDB on mount, writes on change.
   ═══════════════════════════════════════════════════ */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * React hook for IndexedDB-backed state.
 *
 * @param loader  - async function that reads from IDB and returns current value
 * @param saver   - async function that writes the full value to IDB
 * @param initial - fallback while IDB loads (should match what loader returns)
 *
 * Returns [value, setValue] just like useState, but setValue
 * also persists to IndexedDB after each update.
 */
export function useDBState<T>(
  loader: () => Promise<T>,
  saver: (value: T) => Promise<void>,
  initial: T,
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const saverRef = useRef(saver);
  useEffect(() => { saverRef.current = saver; });

  // Load from IDB on mount
  useEffect(() => {
    let cancelled = false;
    loader().then(data => {
      if (!cancelled) {
        setValue(data);
        setLoaded(true);
      }
    }).catch(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [loader]);

  // Set + persist
  const setAndPersist = useCallback((updater: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof updater === 'function'
        ? (updater as (prev: T) => T)(prev)
        : updater;
      // Fire-and-forget persist (don't block UI)
      saverRef.current(next).catch(() => {});
      return next;
    });
  }, []);

  return [value, setAndPersist];
}