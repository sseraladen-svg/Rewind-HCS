'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Palette, HardDrive, User, LogOut, Shield, Info,
  Download, Upload, Trash2, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import EraSkins from '@/components/EraSkins';
import LocalDataBadge from '@/components/ui/LocalDataBadge';
import {
  exportAllData, clearAllStores,
  addJournalEntry,
  addMixtape, clearMixtapes,
  putAllStickers,
  putAllGuestbookEntries,
  saveTamagotchiState,
  addFloppySave,
  putAllChatMessages,
  setMemoryVaultTitles,
  setEraSkinId,
  setLibraryFavorites,
  setReelReaction,
  upsertReelReflection,
} from '@/lib/idb-store';
import type { ExportData } from '@/lib/idb-store';

/* ═══════════════════════════════════════════════════
   Settings Tab — single home for all app configuration
   ═══════════════════════════════════════════════════ */

// ─── Collapsible section wrapper ───
function SettingsSection({
  id,
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="sk-paper rounded-xl overflow-hidden sk-noise">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer
          hover:bg-[#f5edd6]/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#8b5e3c]/10 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-[#8b5e3c]" />
          </div>
          <span className="old-heading font-extrabold text-sm text-[#3d2b1f]">{title}</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-[#a08868]" />
          : <ChevronDown className="h-4 w-4 text-[#a08868]" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Inline Data Management (no longer a separate overlay) ───
function DataManagementInline() {
  const [storageUsed, setStorageUsed] = useState<string>('...');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load on mount
  useState(() => { loadStorageEstimate(); });

  const flashStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  // ─── Export ───
  const handleExport = useCallback(async () => {
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
      for (const entry of data.journal_entries) { await addJournalEntry(entry); }
      await clearMixtapes();
      for (const tape of data.mixtapes) { await addMixtape(tape); }
      if (data.sticker_placements?.length) { await putAllStickers(data.sticker_placements); }
      if (data.guestbook_entries?.length) { await putAllGuestbookEntries(data.guestbook_entries); }
      if (data.tamagotchi_state) { await saveTamagotchiState(data.tamagotchi_state); }
      if (data.floppy_saves_count > 0) { for (let i = 0; i < data.floppy_saves_count; i++) { await addFloppySave('Restored save'); } }
      if (data.chat_messages?.length) { await putAllChatMessages(data.chat_messages); }
      if (data.memory_vault?.length) { await setMemoryVaultTitles(data.memory_vault); }
      if (data.era_skin) { await setEraSkinId(data.era_skin); }
      if (data.library_favorites?.length) { await setLibraryFavorites(data.library_favorites); }
      if (data.reel_reactions) { for (const [key, val] of Object.entries(data.reel_reactions)) { await setReelReaction(key, val); } }
      if (data.reel_reflections?.length) { for (const ref of data.reel_reflections) { await upsertReelReflection(ref); } }
      flashStatus('Data restored! Reload the page to see changes.');
      loadStorageEstimate();
    } catch (err) {
      console.error('Import failed:', err);
      flashStatus('Import failed — check file format.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [flashStatus, loadStorageEstimate]);

  // ─── Clear All ───
  const handleClearAll = useCallback(async () => {
    if (!showConfirmClear) {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 5000);
      return;
    }
    try {
      await clearAllStores();
      flashStatus('All data cleared. Reload the page.');
      loadStorageEstimate();
    } catch (err) {
      console.error('Clear failed:', err);
      flashStatus('Clear failed — check console.');
    }
    setShowConfirmClear(false);
  }, [showConfirmClear, flashStatus, loadStorageEstimate]);

  return (
    <div className="space-y-4">
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

        <button
          onClick={() => fileInputRef.current?.click()}
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
            <div>
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
  );
}

// ─── Account Section ───
function AccountSection({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { data: session } = useSession();

  return (
    <div className="space-y-4">
      {session?.user ? (
        <div className="sk-inset rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8b5e3c]/15 flex items-center justify-center">
                <User className="h-5 w-5 text-[#8b5e3c]" />
              </div>
              <div>
                <p className="old-heading font-extrabold text-sm text-[#3d2b1f]">
                  {session.user.name || 'User'}
                </p>
                <p className="old-typewriter text-[10px] text-[#8b7355]">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold
                flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="old-body text-sm text-[#8b7355] mb-3">
            Sign in to save your memories across devices and keep them safe.
          </p>
          <button
            onClick={onOpenAuth}
            className="sk-btn old-btn px-5 py-2.5 rounded-lg text-sm font-bold
              flex items-center gap-2 cursor-pointer mx-auto"
          >
            <User className="h-4 w-4" /> Create Account / Sign In
          </button>
        </div>
      )}
    </div>
  );
}

// ─── App Info Section ───
function AppInfoSection() {
  return (
    <div className="space-y-4">
      <div className="sk-inset rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="old-body text-sm text-[#5c4033]">App</span>
          <span className="old-typewriter text-xs font-bold text-[#8b5e3c]">REWIND</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="old-body text-sm text-[#5c4033]">Version</span>
          <span className="old-typewriter text-xs font-bold text-[#8b5e3c]">1.0.0</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="old-body text-sm text-[#5c4033]">Storage</span>
          <span className="old-typewriter text-xs font-bold text-[#8b5e3c]">IndexedDB (local)</span>
        </div>
      </div>

      <div className="sk-inset rounded-xl p-4">
        <LocalDataBadge />
      </div>

      <div className="sk-inset rounded-xl p-4">
        <p className="old-body text-xs text-[#8b7355] leading-relaxed">
          Rewind is a nostalgia app that helps you reconnect with the memories,
          culture, and feelings of the era you grew up in. All data stays on your
          device — nothing is ever uploaded to any server.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════════════

export default function SettingsTab({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <p className="old-body text-sm text-[#5c4033] font-medium">
          Customize your Rewind experience.
        </p>
      </div>

      {/* 1. Era Skins — reuses existing component directly */}
      <SettingsSection
        id="era-skins"
        title="Era Themes"
        icon={Palette}
        defaultOpen={true}
      >
        <EraSkins />
      </SettingsSection>

      {/* 2. Data Management — inline, no separate overlay */}
      <SettingsSection
        id="data-mgmt"
        title="Manage Your Data"
        icon={HardDrive}
      >
        <DataManagementInline />
      </SettingsSection>

      {/* 3. Account */}
      <SettingsSection
        id="account"
        title="Account"
        icon={User}
      >
        <AccountSection onOpenAuth={onOpenAuth} />
      </SettingsSection>

      {/* 4. App Info */}
      <SettingsSection
        id="app-info"
        title="App Info"
        icon={Info}
      >
        <AppInfoSection />
      </SettingsSection>
    </div>
  );
}
