'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Plus, X, Heart, Trash2 } from 'lucide-react';
import { getDB } from '@/lib/idb-store';

/* ═══════════════════════════════════════════════════
   Memory Board
   A cork-board style memory pinboard.
   Users pin text memories, organized by color tags.
   Stored in IndexedDB for persistence.
   ═══════════════════════════════════════════════════ */

interface PinnedMemory {
  id: string;
  text: string;
  color: string;
  rotation: number;
  pinnedAt: number;
  liked: boolean;
}

const CARD_COLORS = [
  { id: 'yellow', bg: '#fef3c7', border: '#f59e0b' },
  { id: 'pink', bg: '#fce7f3', border: '#ec4899' },
  { id: 'blue', bg: '#dbeafe', border: '#3b82f6' },
  { id: 'green', bg: '#d1fae5', border: '#10b981' },
  { id: 'purple', bg: '#ede9fe', border: '#8b5cf6' },
];

const BOARD_ID = 'memory-board';
const BOARD_MEMOS_ID = 'memos';

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
    await db.put('era_skin', { id: BOARD_MEMOS_ID, memos });
  } catch {
    // silently fail
  }
}

export default function MemoryBoard() {
  const [memos, setMemos] = useState<PinnedMemory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);

  const loadMemos = useCallback(async () => {
    const m = await getBoardMemos();
    setMemos(m);
  }, []);

  useEffect(() => { loadMemos(); }, [loadMemos]);

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
    const updated = memos.filter(m => m.id !== id);
    setMemos(updated);
    await saveBoardMemos(updated);
  };

  const handleLike = async (id: string) => {
    const updated = memos.map(m => m.id === id ? { ...m, liked: !m.liked } : m);
    setMemos(updated);
    await saveBoardMemos(updated);
  };

  const colorConfig = CARD_COLORS.find(c => c.id === selectedColor.id) || CARD_COLORS[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-[#8b5e3c]" />
          <h2 className="old-label text-sm font-black text-[#5c4033] uppercase tracking-widest">
            Memory Board
          </h2>
          {memos.length > 0 && (
            <span className="sk-vhs-label old-typewriter text-[9px] font-bold px-2 py-0.5 rounded">
              {memos.length} pin{memos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="sk-btn old-btn px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Cancel' : 'Pin a Memory'}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="sk-paper rounded-xl p-4 sk-noise">
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What memory do you want to pin?"
                className="old-body w-full bg-transparent outline-none text-[#3d2b1f] placeholder:text-[#b8a888] text-sm resize-none"
                rows={3}
                autoFocus
              />
              {/* Color picker */}
              <div className="flex items-center gap-2 mt-3 mb-3">
                <span className="old-typewriter text-[9px] text-[#8b7355]">Color:</span>
                {CARD_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                      selectedColor.id === c.id ? 'scale-125 shadow-md' : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: c.bg,
                      borderColor: selectedColor.id === c.id ? c.border : 'transparent',
                    }}
                  />
                ))}
              </div>
              {/* Preview + Add button */}
              <div className="flex items-center justify-between">
                <div
                  className="old-body text-xs px-3 py-2 rounded-lg max-w-[200px] truncate"
                  style={{ backgroundColor: colorConfig.bg, borderLeft: `3px solid ${colorConfig.border}` }}
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

      {/* Board grid */}
      {memos.length === 0 && !showForm ? (
        <div className="sk-cork rounded-xl p-8 sk-noise text-center">
          <Pin className="h-10 w-10 text-[#c4956a]/50 mx-auto mb-3" />
          <p className="old-body text-sm text-[#8b7355]">Your memory board is empty.</p>
          <p className="old-typewriter text-xs text-[#b8a888] mt-1">
            Pin your favorite memories, quotes, or thoughts here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {memos.map((memo, i) => {
              const cfg = CARD_COLORS.find(c => c.id === memo.color) || CARD_COLORS[0];
              return (
                <motion.div
                  key={memo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, rotate: memo.rotation }}
                  animate={{ opacity: 1, scale: 1, rotate: memo.rotation }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.05 }}
                  className="relative group cursor-default"
                  style={{
                    transform: `rotate(${memo.rotation}deg)`,
                  }}
                >
                  {/* Pin icon */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-5 h-5 rounded-full bg-[#c4956a] shadow-md flex items-center justify-center">
                      <Pin className="h-2.5 w-2.5 text-white" style={{ transform: 'rotate(45deg) translate(0.5px, 0.5px)' }} />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="sk-paper p-4 pt-5 min-h-[100px]"
                    style={{
                      backgroundColor: cfg.bg,
                      borderLeft: `4px solid ${cfg.border}`,
                    }}
                  >
                    <p className="old-body text-sm text-[#3d2b1f] leading-relaxed whitespace-pre-wrap">
                      {memo.text}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="old-typewriter text-[8px] text-[#8b7355]">
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
                              color: memo.liked ? '#ef4444' : '#b8a888',
                              fill: memo.liked ? '#ef4444' : 'none',
                            }}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(memo.id)}
                          className="p-1 rounded hover:bg-red-50 cursor-pointer transition-colors"
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
    </div>
  );
}
