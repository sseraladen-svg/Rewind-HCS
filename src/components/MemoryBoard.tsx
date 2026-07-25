'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  Pin,
  Plus,
  X,
  Heart,
  Trash2,
  Search,
  Users,
  MessageCircle,
  Palette,
  StickyNote,
  Magnet,
  Camera,
  Bell,
} from 'lucide-react';
import { getDB } from '@/lib/idb-store';

/* ═══════════════════════════════════════════════════
   Memory Board — Enhanced Collaborative Edition
   Personal corkboard + Shared collaborative board
   with themes, search, stats, and fake friend reactions.
   ═══════════════════════════════════════════════════ */

// ─── Types ───────────────────────────────────────────

interface PinnedMemory {
  id: string;
  text: string;
  color: string;
  rotation: number;
  pinnedAt: number;
  liked: boolean;
}

interface SharedMemory {
  id: string;
  author: string;
  initial: string;
  text: string;
  timestamp: number;
  likes: number;
  comments: number;
  color: string;
  likedByUser?: boolean;
}

interface ToastNotification {
  id: string;
  text: string;
}

type BoardTheme = 'cork' | 'chalkboard' | 'fridge' | 'photowall';
type BoardTab = 'personal' | 'shared';

// ─── Constants ────────────────────────────────────────

const CARD_COLORS = [
  { id: 'yellow', bg: '#fef3c7', border: '#f59e0b' },
  { id: 'pink', bg: '#fce7f3', border: '#ec4899' },
  { id: 'blue', bg: '#dbeafe', border: '#3b82f6' },
  { id: 'green', bg: '#d1fae5', border: '#10b981' },
  { id: 'purple', bg: '#ede9fe', border: '#8b5cf6' },
];

const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
];

const BOARD_MEMOS_ID = 'memos';

const INITIAL_SHARED_MEMORIES: SharedMemory[] = [
  {
    id: 'shared-1',
    author: 'Sarah M.',
    initial: 'S',
    text: 'Remember when we used to trade Pokemon cards at recess? I still have my holographic Charizard!',
    timestamp: Date.now() - 86400000 * 2,
    likes: 12,
    comments: 3,
    color: 'yellow',
  },
  {
    id: 'shared-2',
    author: 'Jake T.',
    initial: 'J',
    text: 'That time we stayed up all night playing GoldenEye 007. My thumbs were sore for days!',
    timestamp: Date.now() - 86400000 * 3,
    likes: 8,
    comments: 1,
    color: 'blue',
  },
  {
    id: 'shared-3',
    author: 'Emily R.',
    initial: 'E',
    text: 'Making mixtapes from the radio was an art form. Pressing record at exactly the right moment...',
    timestamp: Date.now() - 86400000,
    likes: 15,
    comments: 5,
    color: 'pink',
  },
  {
    id: 'shared-4',
    author: 'Marcus W.',
    initial: 'M',
    text: 'Blockbuster Friday nights. Picking a movie was the hardest decision of the week.',
    timestamp: Date.now() - 86400000 * 4,
    likes: 20,
    comments: 7,
    color: 'green',
  },
  {
    id: 'shared-5',
    author: 'Olivia K.',
    initial: 'O',
    text: 'The smell of a new Lisa Frank folder. That was peak back-to-school excitement.',
    timestamp: Date.now() - 86400000 * 1.5,
    likes: 10,
    comments: 2,
    color: 'purple',
  },
  {
    id: 'shared-6',
    author: 'Daniel P.',
    initial: 'D',
    text: 'Dial-up internet sounds will forever be burned into my brain. KRRRR BZZZT CHHHHH.',
    timestamp: Date.now() - 86400000 * 5,
    likes: 18,
    comments: 4,
    color: 'yellow',
  },
];

const FAKE_REACTIONS = [
  'Sarah M. liked your memory',
  'Jake T. commented: "So true!"',
  'Emily R. liked your memory',
  'Marcus W. commented: "I remember that!"',
  'Olivia K. liked your memory',
  'Daniel P. commented: "Those were the days"',
  'Sarah M. commented: "Miss those times"',
  'Jake T. liked your memory',
  'Emily R. commented: "Haha yes!"',
  'Marcus W. liked your memory',
];

const THEMES: { id: BoardTheme; label: string; icon: typeof Palette }[] = [
  { id: 'cork', label: 'Cork', icon: StickyNote },
  { id: 'chalkboard', label: 'Chalkboard', icon: Palette },
  { id: 'fridge', label: 'Fridge', icon: Magnet },
  { id: 'photowall', label: 'Photo Wall', icon: Camera },
];

// ─── Theme style helpers ─────────────────────────────

function getThemeStyles(theme: BoardTheme) {
  switch (theme) {
    case 'cork':
      return {
        boardBg: 'bg-[#c4956a]/10',
        boardTexture: 'sk-cork',
        cardBase: 'sk-paper',
        textColor: 'text-[#3d2b1f]',
        subtextColor: 'text-[#8b7355]',
        placeholderColor: 'placeholder:text-[#b8a888]',
        pinColor: '#c4956a',
        headerColor: 'text-[#5c4033]',
      };
    case 'chalkboard':
      return {
        boardBg: 'bg-[#2d4a2d]',
        boardTexture: '',
        cardBase: 'bg-[#1a3a1a] border border-[#4a7a4a]/30 rounded-lg',
        textColor: 'text-[#e0e0e0]',
        subtextColor: 'text-[#8ab88a]',
        placeholderColor: 'placeholder:text-[#5a8a5a]',
        pinColor: '#e0e0e0',
        headerColor: 'text-[#e0e0e0]',
      };
    case 'fridge':
      return {
        boardBg: 'bg-[#e8e8e8]',
        boardTexture: 'sk-leather',
        cardBase: 'bg-white shadow-lg border border-[#d0d0d0] rounded-lg',
        textColor: 'text-[#1a1a1a]',
        subtextColor: 'text-[#666666]',
        placeholderColor: 'placeholder:text-[#999999]',
        pinColor: '#ff4444',
        headerColor: 'text-[#333333]',
      };
    case 'photowall':
      return {
        boardBg: 'bg-[#1a1a1a]',
        boardTexture: '',
        cardBase: 'bg-[#2a2a2a] border border-[#444] rounded-lg',
        textColor: 'text-[#e8e8e8]',
        subtextColor: 'text-[#999999]',
        placeholderColor: 'placeholder:text-[#666666]',
        pinColor: '#ffffff',
        headerColor: 'text-[#e8e8e8]',
      };
  }
}

function getChalkboardCardBg(color: string) {
  const map: Record<string, string> = {
    yellow: 'bg-[#3d3a1a]/60 border-l-4 border-l-[#c9b458]',
    pink: 'bg-[#3d1a2a]/60 border-l-4 border-l-[#c9588a]',
    blue: 'bg-[#1a2a3d]/60 border-l-4 border-l-[#5890c9]',
    green: 'bg-[#1a3d2a]/60 border-l-4 border-l-[#58c970]',
    purple: 'bg-[#2a1a3d]/60 border-l-4 border-l-[#9058c9]',
  };
  return map[color] || map.yellow;
}

// ─── IDB helpers ──────────────────────────────────────

async function getBoardMemos(): Promise<PinnedMemory[]> {
  try {
    const db = await getDB();
    const record: any = await db.get('era_skin', BOARD_MEMOS_ID);
    return record?.memos || [];
  } catch {
    return [];
  }
}

async function saveBoardMemos(memos: PinnedMemory[]): Promise<void> {
  try {
    const db = await getDB();
    await db.put('era_skin', { id: BOARD_MEMOS_ID, skin_id: 'board', memos } as any);
  } catch {
    // silently fail
  }
}

// ─── Component ────────────────────────────────────────

export default function MemoryBoard() {
  // State
  const [memos, setMemos] = useState<PinnedMemory[]>([]);
  const [sharedMemos, setSharedMemos] = useState<SharedMemory[]>(INITIAL_SHARED_MEMORIES);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);
  const [activeTab, setActiveTab] = useState<BoardTab>('personal');
  const [theme, setTheme] = useState<BoardTheme>('cork');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [sharedFormText, setSharedFormText] = useState('');
  const [sharedFormColor, setSharedFormColor] = useState(CARD_COLORS[0]);
  const [showSharedForm, setShowSharedForm] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ts = getThemeStyles(theme);

  // ── Load personal memos from IDB
  const loadMemos = useCallback(async () => {
    const m = await getBoardMemos();
    setMemos(m);
  }, []);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  // ── Fake reaction toasts (only when on shared tab)
  useEffect(() => {
    if (activeTab !== 'shared') {
      if (toastTimerRef.current) {
        clearInterval(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      return;
    }

    const showRandomToast = () => {
      const randomReaction =
        FAKE_REACTIONS[Math.floor(Math.random() * FAKE_REACTIONS.length)];
      const toast: ToastNotification = {
        id: `toast-${Date.now()}-${Math.random()}`,
        text: randomReaction,
      };
      setToasts((prev) => [...prev.slice(-2), toast]); // keep max 3

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };

    toastTimerRef.current = setInterval(showRandomToast, 6000 + Math.random() * 4000);

    // Show initial toast after a short delay
    const initialTimeout = setTimeout(showRandomToast, 2000);

    return () => {
      if (toastTimerRef.current) clearInterval(toastTimerRef.current);
      clearTimeout(initialTimeout);
    };
  }, [activeTab]);

  // ── Personal board handlers
  const handleAdd = async () => {
    if (!newText.trim()) return;
    const memo: PinnedMemory = {
      id: `memo-${Date.now()}`,
      text: newText.trim(),
      color: selectedColor.id,
      rotation: (Math.random() - 0.5) * 8,
      pinnedAt: Date.now(),
      liked: false,
    };
    const updated = [memo, ...memos];
    setMemos(updated);
    await saveBoardMemos(updated);
    setNewText('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    const updated = memos.filter((m) => m.id !== id);
    setMemos(updated);
    await saveBoardMemos(updated);
  };

  const handleLike = async (id: string) => {
    const updated = memos.map((m) =>
      m.id === id ? { ...m, liked: !m.liked } : m,
    );
    setMemos(updated);
    await saveBoardMemos(updated);
  };

  // ── Shared board handlers
  const handleSharedLike = (id: string) => {
    setSharedMemos((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              likedByUser: !m.likedByUser,
              likes: m.likedByUser ? m.likes - 1 : m.likes + 1,
            }
          : m,
      ),
    );
  };

  const handleSharedComment = (id: string) => {
    setSharedMemos((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, comments: m.comments + 1 } : m,
      ),
    );
  };

  const handleAddToShared = () => {
    if (!sharedFormText.trim()) return;
    const newShared: SharedMemory = {
      id: `shared-user-${Date.now()}`,
      author: 'You',
      initial: 'Y',
      text: sharedFormText.trim(),
      timestamp: Date.now(),
      likes: 0,
      comments: 0,
      color: sharedFormColor.id,
      likedByUser: false,
    };
    setSharedMemos((prev) => [newShared, ...prev]);
    setSharedFormText('');
    setShowSharedForm(false);
  };

  // ── Filtering
  const filteredPersonal = searchQuery.trim()
    ? memos.filter((m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : memos;

  const filteredShared = searchQuery.trim()
    ? sharedMemos.filter((m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : sharedMemos;

  // ── Stats
  const totalLikes = memos.filter((m) => m.liked).length + sharedMemos.filter((m) => m.likedByUser).length;
  const totalShared = sharedMemos.length;

  const colorConfig =
    CARD_COLORS.find((c) => c.id === selectedColor.id) || CARD_COLORS[0];
  const sharedColorConfig =
    CARD_COLORS.find((c) => c.id === sharedFormColor.id) || CARD_COLORS[0];

  // ── Helper: get avatar color from name
  function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  // ── Helper: format relative time
  function formatRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────

  return (
    <div className="space-y-4 relative">
      {/* ═══ Toast Notifications ═══ */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="pointer-events-auto sk-paper sk-noise rounded-lg px-4 py-2.5 shadow-xl max-w-[280px] border border-[#e0d5c0] flex items-center gap-2"
            >
              <Bell className="h-3.5 w-3.5 text-[#8b5e3c] shrink-0" />
              <span className="old-body text-xs text-[#5c4033]">{toast.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══ Header Row ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-[#8b5e3c]" />
          <h2 className={`old-label text-sm font-black uppercase tracking-widest ${ts.headerColor}`}>
            Memory Board
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Cancel' : 'Pin a Memory'}
        </button>
      </div>

      {/* ═══ Theme Switcher ═══ */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="old-typewriter text-[9px] text-[#8b7355] uppercase tracking-wider">Theme:</span>
        {THEMES.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer border ${
                isActive
                  ? t.id === 'cork'
                    ? 'bg-[#c4956a] text-white border-[#a07850]'
                    : t.id === 'chalkboard'
                      ? 'bg-[#2d4a2d] text-[#e0e0e0] border-[#4a7a4a]'
                      : t.id === 'fridge'
                        ? 'bg-[#d0d0d0] text-[#333] border-[#aaa]'
                        : 'bg-[#333] text-white border-[#555]'
                  : 'bg-transparent text-[#8b7355] border-transparent hover:border-[#d0c0a0]'
              }`}
            >
              <Icon className="h-3 w-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ═══ Tab Switcher ═══ */}
      <div className="flex items-center gap-1 sk-inset rounded-lg p-1">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'personal'
              ? 'sk-paper sk-noise shadow-sm'
              : 'hover:bg-black/5'
          }`}
        >
          <Pin className="h-3.5 w-3.5 inline mr-1" />
          Personal Board
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`flex-1 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'shared'
              ? 'sk-paper sk-noise shadow-sm'
              : 'hover:bg-black/5'
          }`}
        >
          <Users className="h-3.5 w-3.5 inline mr-1" />
          Shared Board
        </button>
      </div>

      {/* ═══ Search ═══ */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#b8a888]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search memories..."
          className={`sk-inset w-full pl-9 pr-4 py-2 rounded-lg text-xs old-body bg-transparent outline-none ${ts.textColor} ${ts.placeholderColor}`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5 cursor-pointer"
          >
            <X className="h-3 w-3 text-[#b8a888]" />
          </button>
        )}
      </div>

      {/* ═══ Stats Row ═══ */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <Pin className="h-2.5 w-2.5" />
          {memos.length} pin{memos.length !== 1 ? 's' : ''}
        </span>
        <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <Heart className="h-2.5 w-2.5" />
          {totalLikes} like{totalLikes !== 1 ? 's' : ''}
        </span>
        <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <Users className="h-2.5 w-2.5" />
          {totalShared} shared
        </span>
        {activeTab === 'shared' && (
          <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ml-auto">
            <Users className="h-2.5 w-2.5" />
            Board Members: 6
          </span>
        )}
      </div>

      {/* ═══ Add Personal Memo Form ═══ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`sk-paper rounded-xl p-4 sk-noise ${theme === 'chalkboard' ? '!bg-[#1a3a1a]/80' : ''}`}>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What memory do you want to pin?"
                className={`old-body w-full bg-transparent outline-none ${ts.textColor} ${ts.placeholderColor} text-sm resize-none`}
                rows={3}
                autoFocus
              />
              {/* Color picker */}
              <div className="flex items-center gap-2 mt-3 mb-3">
                <span className={`old-typewriter text-[9px] ${ts.subtextColor}`}>Color:</span>
                {CARD_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                      selectedColor.id === c.id
                        ? 'scale-125 shadow-md'
                        : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: c.bg,
                      borderColor:
                        selectedColor.id === c.id ? c.border : 'transparent',
                    }}
                  />
                ))}
              </div>
              {/* Preview + Add button */}
              <div className="flex items-center justify-between">
                <div
                  className="old-body text-xs px-3 py-2 rounded-lg max-w-[200px] truncate"
                  style={{
                    backgroundColor: colorConfig.bg,
                    borderLeft: `3px solid ${colorConfig.border}`,
                  }}
                >
                  {newText || 'Preview...'}
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!newText.trim()}
                  className="sk-btn old-btn px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Pin className="h-3.5 w-3.5" /> Pin It
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSONAL BOARD */}

      {activeTab === 'personal' && (
        <>
          {filteredPersonal.length === 0 && !showForm ? (
            <div
              className={`${ts.boardTexture} ${ts.boardBg} rounded-xl p-8 sk-noise text-center`}
            >
              <Pin className={`h-10 w-10 mx-auto mb-3 ${ts.subtextColor} opacity-50`} />
              <p className={`old-body text-sm ${ts.subtextColor}`}>
                {searchQuery
                  ? 'No memories match your search.'
                  : 'Your memory board is empty.'}
              </p>
              <p className={`old-typewriter text-xs ${ts.subtextColor} mt-1 opacity-70`}>
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Pin your favorite memories, quotes, or thoughts here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredPersonal.map((memo, i) => {
                  const cfg =
                    CARD_COLORS.find((c) => c.id === memo.color) || CARD_COLORS[0];

                  // Theme-specific card styling
                  let cardStyle: React.CSSProperties = {};
                  let cardClass = ts.cardBase + ' p-4 pt-5 min-h-[100px]';

                  if (theme === 'cork') {
                    cardStyle = {
                      backgroundColor: cfg.bg,
                      borderLeft: `4px solid ${cfg.border}`,
                    };
                  } else if (theme === 'chalkboard') {
                    cardClass = `${getChalkboardCardBg(memo.color)} p-4 pt-5 min-h-[100px] rounded-lg`;
                  } else if (theme === 'fridge') {
                    cardStyle = {
                      backgroundColor: cfg.bg,
                      borderTop: `4px solid ${cfg.border}`,
                    };
                  } else {
                    cardStyle = {
                      backgroundColor: cfg.bg,
                      borderLeft: `4px solid ${cfg.border}`,
                    };
                  }

                  const isDark = theme === 'chalkboard' || theme === 'photowall';
                  const textCls = isDark ? 'text-[#e0e0e0]' : 'text-[#3d2b1f]';
                  const subCls = isDark ? 'text-[#8ab88a]' : 'text-[#8b7355]';

                  return (
                    <motion.div
                      key={memo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, rotate: memo.rotation }}
                      animate={{ opacity: 1, scale: 1, rotate: memo.rotation }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                        delay: i * 0.05,
                      }}
                      className="relative group cursor-default"
                      style={{ transform: `rotate(${memo.rotation}deg)` }}
                    >
                      {/* Pin icon */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                        <div
                          className="w-5 h-5 rounded-full shadow-md flex items-center justify-center"
                          style={{ backgroundColor: ts.pinColor }}
                        >
                          <Pin
                            className="h-2.5 w-2.5"
                            style={{
                              color:
                                theme === 'photowall' || theme === 'chalkboard'
                                  ? '#1a1a1a'
                                  : 'white',
                              transform: 'rotate(45deg) translate(0.5px, 0.5px)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Card */}
                      <div className={cardClass} style={cardStyle}>
                        <p
                          className={`old-body text-sm ${textCls} leading-relaxed whitespace-pre-wrap`}
                        >
                          {memo.text}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`old-typewriter text-[8px] ${subCls}`}>
                            {new Date(memo.pinnedAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleLike(memo.id)}
                              className="p-1 rounded hover:bg-black/5 cursor-pointer transition-colors"
                            >
                              <Heart
                                className="h-3.5 w-3.5"
                                style={{
                                  color: memo.liked ? '#ef4444' : subCls.includes('8ab') ? '#5a8a5a' : '#b8a888',
                                  fill: memo.liked ? '#ef4444' : 'none',
                                }}
                              />
                            </button>
                            <button
                              onClick={() => handleDelete(memo.id)}
                              className="p-1 rounded hover:bg-red-500/10 cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* SHARED BOARD */}

      {activeTab === 'shared' && (
        <>
          {/* Add to shared form */}
          <div className="flex items-center justify-between">
            <p className={`old-body text-xs ${ts.subtextColor}`}>
              Collaborative memories from friends
            </p>
            <button
              onClick={() => setShowSharedForm(!showSharedForm)}
              className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {showSharedForm ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {showSharedForm ? 'Cancel' : 'Add to Shared Board'}
            </button>
          </div>

          <AnimatePresence>
            {showSharedForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={`sk-paper rounded-xl p-4 sk-noise ${theme === 'chalkboard' ? '!bg-[#1a3a1a]/80' : ''}`}>
                  <textarea
                    value={sharedFormText}
                    onChange={(e) => setSharedFormText(e.target.value)}
                    placeholder="Share a nostalgic memory with the group..."
                    className={`old-body w-full bg-transparent outline-none ${ts.textColor} ${ts.placeholderColor} text-sm resize-none`}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex items-center gap-2 mt-3 mb-3">
                    <span className={`old-typewriter text-[9px] ${ts.subtextColor}`}>
                      Color:
                    </span>
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSharedFormColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          sharedFormColor.id === c.id
                            ? 'scale-125 shadow-md'
                            : 'hover:scale-110'
                        }`}
                        style={{
                          backgroundColor: c.bg,
                          borderColor:
                            sharedFormColor.id === c.id ? c.border : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <div
                      className="old-body text-xs px-3 py-2 rounded-lg max-w-[200px] truncate hidden sm:block"
                      style={{
                        backgroundColor: sharedColorConfig.bg,
                        borderLeft: `3px solid ${sharedColorConfig.border}`,
                      }}
                    >
                      {sharedFormText || 'Preview...'}
                    </div>
                    <button
                      onClick={handleAddToShared}
                      disabled={!sharedFormText.trim()}
                      className="sk-btn old-btn px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3.5 w-3.5" /> Share It
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shared memos list */}
          {filteredShared.length === 0 ? (
            <div
              className={`${ts.boardTexture} ${ts.boardBg} rounded-xl p-8 sk-noise text-center`}
            >
              <Users className={`h-10 w-10 mx-auto mb-3 ${ts.subtextColor} opacity-50`} />
              <p className={`old-body text-sm ${ts.subtextColor}`}>
                {searchQuery
                  ? 'No shared memories match your search.'
                  : 'No shared memories yet.'}
              </p>
              <p className={`old-typewriter text-xs ${ts.subtextColor} mt-1 opacity-70`}>
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Be the first to share a nostalgic moment!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredShared.map((memo, i) => {
                  const cfg =
                    CARD_COLORS.find((c) => c.id === memo.color) || CARD_COLORS[0];
                  const avatarColor = getAvatarColor(memo.author);
                  const isDark = theme === 'chalkboard' || theme === 'photowall';

                  // Card style by theme
                  let cardOuterClass = 'rounded-lg p-4';
                  let cardOuterStyle: React.CSSProperties = {};

                  if (theme === 'cork') {
                    cardOuterClass = 'sk-paper rounded-lg p-4';
                    cardOuterStyle = {
                      backgroundColor: cfg.bg,
                      borderLeft: `4px solid ${cfg.border}`,
                    };
                  } else if (theme === 'chalkboard') {
                    cardOuterClass = `${getChalkboardCardBg(memo.color)} p-4 rounded-lg`;
                  } else if (theme === 'fridge') {
                    cardOuterClass = 'bg-white shadow-lg border border-[#d0d0d0] rounded-lg p-4';
                    cardOuterStyle = {
                      borderTop: `4px solid ${cfg.border}`,
                    };
                  } else {
                    cardOuterClass = 'bg-[#2a2a2a] border border-[#444] rounded-lg p-4';
                    cardOuterStyle = {
                      borderLeft: `4px solid ${cfg.border}`,
                    };
                  }

                  const textCls = isDark ? 'text-[#e0e0e0]' : 'text-[#3d2b1f]';
                  const subCls = isDark
                    ? 'text-[#8ab88a]'
                    : 'text-[#8b7355]';

                  return (
                    <motion.div
                      key={memo.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                        delay: i * 0.05,
                      }}
                      className={cardOuterClass}
                      style={cardOuterStyle}
                    >
                      <div className="flex gap-3">
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm old-title shadow-md"
                          style={{ backgroundColor: avatarColor }}
                        >
                          {memo.initial}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`old-label text-xs font-bold ${textCls}`}
                            >
                              {memo.author}
                            </span>
                            <span
                              className={`old-typewriter text-[8px] ${subCls}`}
                            >
                              {formatRelativeTime(memo.timestamp)}
                            </span>
                          </div>

                          <p
                            className={`old-body text-sm ${textCls} leading-relaxed whitespace-pre-wrap`}
                          >
                            {memo.text}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-2.5">
                            <button
                              onClick={() => handleSharedLike(memo.id)}
                              className={`flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer rounded px-1.5 py-0.5 ${
                                memo.likedByUser
                                  ? 'text-red-500 bg-red-500/10'
                                  : `${subCls} hover:bg-black/5`
                              }`}
                            >
                              <Heart
                                className="h-3 w-3"
                                style={{
                                  fill: memo.likedByUser ? '#ef4444' : 'none',
                                  color: memo.likedByUser ? '#ef4444' : undefined,
                                }}
                              />
                              {memo.likes}
                            </button>
                            <button
                              onClick={() => handleSharedComment(memo.id)}
                              className={`flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer rounded px-1.5 py-0.5 ${subCls} hover:bg-black/5`}
                            >
                              <MessageCircle className="h-3 w-3" />
                              {memo.comments}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
