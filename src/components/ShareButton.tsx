'use client';

import { useState, useCallback } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  text: string;
  mood?: string;
  date?: string;
}

export default function ShareButton({ text, mood, date }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = useCallback(async () => {
    const moodEmoji = mood ? ` ${mood}` : '';
    const dateStr = date ? ` — ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : '';
    const shareText = `"${text.slice(0, 200)}"${moodEmoji}${dateStr}\n\n— from Rewind 📼`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Rewind Memory',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or clipboard failed
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      }
    }
  }, [text, mood, date]);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#d4c5a9]/50 hover:bg-[#c4956a]/30 transition-colors cursor-pointer"
        title="Share this memory"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="h-3.5 w-3.5 text-green-700" />
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Share2 className="h-3.5 w-3.5 text-[#8b7355]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-[#3d2b1f] text-[#faf6eb] text-[10px] px-2 py-1 rounded whitespace-nowrap old-typewriter z-10"
          >
            <Copy className="h-3 w-3 inline mr-1" />
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}