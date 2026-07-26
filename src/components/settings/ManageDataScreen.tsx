'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Upload, Trash2, HardDrive, Shield,
  AlertTriangle, CheckCircle2, FileJson,
} from 'lucide-react';
import { soundButtonClick, soundFloppyInsert, soundSave, soundDelete } from '@/lib/sounds';
import {
  exportAllData, clearAllStores,
  getAllJournalEntries, addJournalEntry, putJournalEntry, deleteJournalEntry,
  addCameraPhoto,
  addMixtape, clearMixtapes,
  addSticker, putAllStickers, clearStickers,
  addGuestbookEntry, putAllGuestbookEntries, clearGuestbookEntries,
  saveTamagotchiState, clearTamagotchiState,
  addFloppySave, clearFloppySaves,
  addVoicemail, clearVoicemails,
  addChatMessage, putAllChatMessages, clearChatMessages,
  setMemoryVaultTitles, clearMemoryVault,
  setEraSkinId, clearEraSkin,
  setLibraryFavorites, clearLibraryFavorites,
  setReelReaction, clearReelReactions,
  upsertReelReflection, clearReelReflections,
  incrementVisitCount, clearVisitCount,
} from '@/lib/idb-store';
import type { ExportData } from '@/lib/idb-store';

/* ═══════ MANAGE DATA SCREEN ═══════ */

export default function ManageDataScreen({ onClose }: { onClose: () => void }) {
  const [storageUsed, setStorageUsed] = useState<string>('...');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load storage estimate on mount
  const loadStorageEstimate = useCallback(async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const est = await navigator.storage.estimate();
        const bytes = est.usage ?? 0;
        if (bytes < 1024) setStorageUsed(`${bytes} B`);
        else if (bytes < 1024 * 1024) setStorageUsed(`${(bytes / 1024).toFixed(1)} KB`);
        else setStorageUsed(`${(bytes / (1024 * 1024)).toFixed(2)} MB`);
      } else {
        setStorageUsed('N/A');
      }
    } catch {
      setStorageUsed('N/A');
    }
  }, []);

  // Use a timeout-based approach to refresh on mount
  useState(() => {
    loadStorageEstimate();
  });

  const flashStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  // ─── Export ───
  const handleExport = useCallback(async () => {
    soundFloppyInsert();
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rewind-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      flashStatus('Backup downloaded!');
    } catch (err) {
      console.error('Export failed:', err);
      flashStatus('Export failed — check console.');
    }
  }, [flashStatus]);

  // ─── Import ───
  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);
      if (!data.version || !data.journal_entries) {
        flashStatus('Invalid backup file.');
        return;
      }

      // Restore each store
      // Journal
      for (const entry of data.journal_entries) {
        await addJournalEntry(entry);
      }
      // Mixtapes
      await clearMixtapes();
      for (const tape of data.mixtapes) {
        await addMixtape(tape);
      }
      // Stickers
      if (data.sticker_placements?.length) {
        await putAllStickers(data.sticker_placements);
      }
      // Guestbook
      if (data.guestbook_entries?.length) {
        await putAllGuestbookEntries(data.guestbook_entries);
      }
      // Tamagotchi
      if (data.tamagotchi_state) {
        await saveTamagotchiState(data.tamagotchi_state);
      }
      // Floppy saves
      if (data.floppy_saves_count > 0) {
        for (let i = 0; i < data.floppy_saves_count; i++) {
          await addFloppySave('Restored save');
        }
      }
      // Chat messages
      if (data.chat_messages?.length) {
        await putAllChatMessages(data.chat_messages);
      }
      // Memory vault
      if (data.memory_vault?.length) {
        await setMemoryVaultTitles(data.memory_vault);
      }
      // Era skin
      if (data.era_skin) {
        await setEraSkinId(data.era_skin);
      }
      // Library favorites
      if (data.library_favorites?.length) {
        await setLibraryFavorites(data.library_favorites);
      }
      // Reel reactions
      if (data.reel_reactions) {
        for (const [key, val] of Object.entries(data.reel_reactions)) {
          await setReelReaction(key, val);
        }
      }
      // Reel reflections
      if (data.reel_reflections?.length) {
        for (const ref of data.reel_reflections) {
          await upsertReelReflection(ref);
        }
      }

      flashStatus('Data restored! Reload the page to see changes.');
      soundSave();
      loadStorageEstimate();
    } catch (err) {
      console.error('Import failed:', err);
      flashStatus('Import failed — check file format.');
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [flashStatus, loadStorageEstimate]);

  // ─── Clear All ───
  const handleClearAll = useCallback(async () => {
    soundButtonClick();
    if (!showConfirmClear) {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 5000);
      return;
    }
    try {
      await clearAllStores();
      soundDelete();
      flashStatus('All data cleared. Reload the page.');
      loadStorageEstimate();
    } catch (err) {
      console.error('Clear failed:', err);
      flashStatus('Clear failed — check console.');
    }
    setShowConfirmClear(false);
  }, [showConfirmClear, flashStatus, loadStorageEstimate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(61,43,31,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md sk-paper rounded-2xl shadow-2xl overflow-hidden sk-noise"
      >
        {/* Header */}
        <div className="sk-leather px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-[#d4a574]" />
            <h2 className="old-title text-lg font-black text-[#faf6eb]">
              Manage Your Data
            </h2>
          </div>
          <button
            onClick={() => { soundButtonClick(); onClose(); }}
            className="w-8 h-8 rounded-full flex items-center justify-center
              hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 text-[#d4a574]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Storage usage */}
          <div className="sk-inset rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#8b5e3c]" />
              <span className="old-body text-sm text-[#5c4033]">Local storage used</span>
            </div>
            <span className="old-typewriter text-sm font-bold text-[#8b5e3c]">
              {storageUsed}
            </span>
          </div>

          {/* Trust note */}
          <div className="flex items-start gap-2 px-1">
            <Shield className="h-3.5 w-3.5 text-[#c4956a] mt-0.5 shrink-0" />
            <p className="old-body text-xs text-[#8b7355] leading-relaxed">
              All data is stored locally on this device using IndexedDB.
              Nothing is ever sent to a server. Export a backup to keep
              your memories safe.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full sk-btn old-btn px-4 py-3 rounded-xl text-sm font-bold
                flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#8b5e3c]/10 flex items-center justify-center">
                <Download className="h-4 w-4 text-[#8b5e3c]" />
              </div>
              <div className="text-left">
                <div className="text-[#3d2b1f]">Export Backup</div>
                <div className="text-[10px] text-[#8b7355] font-normal normal-case tracking-normal">
                  Download all your data as a JSON file
                </div>
              </div>
            </button>

            {/* Import */}
            <button
              onClick={() => { soundButtonClick(); fileInputRef.current?.click(); }}
              className="w-full sk-btn old-btn px-4 py-3 rounded-xl text-sm font-bold
                flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#8b5e3c]/10 flex items-center justify-center">
                <Upload className="h-4 w-4 text-[#8b5e3c]" />
              </div>
              <div className="text-left">
                <div className="text-[#3d2b1f]">Import Backup</div>
                <div className="text-[10px] text-[#8b7355] font-normal normal-case tracking-normal">
                  Restore from a previously exported file
                </div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />

            {/* Clear All */}
            <button
              onClick={handleClearAll}
              className={`w-full old-btn px-4 py-3 rounded-xl text-sm font-bold
                flex items-center gap-3 cursor-pointer border transition-colors
                ${showConfirmClear
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'sk-btn text-[#3d2b1f] hover:border-red-300'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                ${showConfirmClear ? 'bg-red-100' : 'bg-red-50'}`}
              >
                {showConfirmClear
                  ? <AlertTriangle className="h-4 w-4 text-red-600" />
                  : <Trash2 className="h-4 w-4 text-red-400" />
                }
              </div>
              <div className="text-left">
                <div className={showConfirmClear ? '' : ''}>
                  {showConfirmClear
                    ? 'Tap again to confirm — this cannot be undone!'
                    : 'Clear All Data'}
                </div>
                {!showConfirmClear && (
                  <div className="text-[10px] text-[#8b7355] font-normal normal-case tracking-normal">
                    Permanently delete everything stored on this device
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Status message */}
          <AnimatePresence>
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 justify-center py-2 px-3 rounded-lg
                  bg-[#8b5e3c]/10"
              >
                <CheckCircle2 className="h-4 w-4 text-[#8b5e3c]" />
                <span className="old-typewriter text-xs text-[#5c4033]">
                  {statusMessage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}