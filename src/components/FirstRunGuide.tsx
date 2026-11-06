'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Clapperboard,
  Clock3,
  Film,
  Gamepad2,
  LockKeyhole,
  Phone,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GuideStep {
  title: string;
  icon: ReactNode;
  description: ReactNode;
  tip: string;
}

function getGuideSteps(birthYear: number): GuideStep[] {
  return [
    {
      title: 'Your year sets the scene',
      icon: <Clock3 className="h-5 w-5" />,
      description: (
        <span className="block">
          You chose <strong>{birthYear}</strong>. Rewind uses your birth year to shape your
          personal timeline, decade colors, and nostalgic details. Choosing a different year
          on the welcome screen builds a different era-themed dashboard.
        </span>
      ),
      tip: 'You can start with any year from 1970 to 2019 on the welcome screen.',
    },
    {
      title: 'Take a trip through the Reel',
      icon: <Clapperboard className="h-5 w-5" />,
      description: (
        <span className="block">
          Open <strong>Reel</strong> in the tab bar for a full-screen stream of memories,
          discoveries, and then-versus-now moments. Move through the cards by scrolling,
          swiping, or using the arrow keys.
        </span>
      ),
      tip: 'Press Escape to leave the Reel and return to your dashboard.',
    },
    {
      title: 'Play a few Games',
      icon: <Gamepad2 className="h-5 w-5" />,
      description: (
        <span className="block">
          Choose <strong>Games</strong> to play Memory Match, Guess The Year, or Tap The
          Memory. Match identical cards, pick the year an item became popular, or tap
          nostalgia as it appears before the timer runs out.
        </span>
      ),
      tip: 'Each game uses items from the era selected by your birth year.',
    },
    {
      title: 'Use the Vintage Camera',
      icon: <Camera className="h-5 w-5" />,
      description: (
        <span className="block">
          Select the camera button in the header and allow camera access when your browser
          asks. Choose photo or video mode, try a vintage filter, switch between front and
          rear cameras, and use the flash toggle before capturing. Your captured photos are
          available in <strong>Memory</strong>.
        </span>
      ),
      tip: 'Camera access requires browser permission; you can also add photos from your device in Memory.',
    },
    {
      title: 'Keep memories and write',
      icon: <BookOpen className="h-5 w-5" />,
      description: (
        <span className="block">
          <strong>Memory</strong> is where you can browse camera photos, switch between grid
          and filmstrip views, and add pictures from your device. In <strong>Journal</strong>,
          write an entry and give it a mood or weather tag.
        </span>
      ),
      tip: 'Your journal and camera photos are saved in this browser on your device.',
    },
    {
      title: 'Explore your Timeline',
      icon: <Clock3 className="h-5 w-5" />,
      description: (
        <span className="block">
          The <strong>Timeline</strong> gathers life milestones, your photo timeline, the
          shared Memory Board, and AI Insights. Scroll down the page to explore each section.
        </span>
      ),
      tip: 'The timeline is personalized from the birth year you entered.',
    },
    {
      title: 'Visit Contacts',
      icon: <Phone className="h-5 w-5" />,
      description: (
        <span className="block">
          Open <strong>Contacts</strong> to browse the rotary phone, voice messages, and
          retro chat. Pick a contact or folder to see its nostalgic interaction.
        </span>
      ),
      tip: 'Chat messages and reactions are designed to feel like an old-school messenger.',
    },
    {
      title: 'Find the other tools',
      icon: <Search className="h-5 w-5" />,
      description: (
        <span className="block">
          Use the search button or <kbd className="rounded border px-1">Ctrl/⌘ K</kbd> to
          find sections. <strong>This Day in History</strong> highlights events from today;
          <strong> Settings</strong> includes preferences and data tools. Sign-in is
          optional for account and sync features.
        </span>
      ),
      tip: 'The camera is always available from the dashboard header.',
    },
    {
      title: 'Movies are in development',
      icon: <LockKeyhole className="h-5 w-5" />,
      description: (
        <span className="block">
          <strong>Movies</strong> is currently locked while the feature is in development.
          It is not available yet; we will open it when it is ready.
        </span>
      ),
      tip: 'The lock beside Movies in the tab bar opens this status note.',
    },
  ];
}

export function FirstRunGuide({
  open,
  birthYear,
  onClose,
}: {
  open: boolean;
  birthYear: number;
  onClose: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = getGuideSteps(birthYear);
  const step = steps[stepIndex];

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sk-paper sk-noise max-h-[90vh] overflow-y-auto sm:max-w-lg" showCloseButton={false}>
        <DialogHeader className="pr-8">
          <div className="flex items-center gap-2 text-[#8b5e3c]">
            {step.icon}
            <span className="old-typewriter text-[10px] font-bold uppercase tracking-widest">
              Rewind starter guide · {stepIndex + 1} of {steps.length}
            </span>
          </div>
          <DialogTitle className="old-title text-2xl font-black text-[#3d2b1f]">
            {step.title}
          </DialogTitle>
          <DialogDescription className="old-body text-sm leading-relaxed text-[#6b5543]">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[#d4c5a9]"
            role="progressbar"
            aria-label="Starter guide progress"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={stepIndex + 1}
          >
            <div
              className="h-full rounded-full bg-[#8b5e3c] transition-all"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="sk-inset rounded-lg p-3 old-typewriter text-xs leading-relaxed text-[#6b5543]">
            {step.tip}
          </p>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="old-typewriter text-xs font-semibold text-[#8b7355] underline underline-offset-4"
          >
            Skip guide
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((index) => index - 1)}
                className="sk-btn old-btn inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            {stepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStepIndex((index) => index + 1)}
                className="sk-btn old-btn inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="sk-leather old-btn rounded-lg px-4 py-2 text-xs font-bold text-[#faf6eb]"
              >
                Start exploring
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MovieDevelopmentNotice({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sk-paper sk-noise sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#8b5e3c]">
            <LockKeyhole className="h-5 w-5" />
            <span className="old-typewriter text-[10px] font-bold uppercase tracking-widest">
              Feature status
            </span>
          </div>
          <DialogTitle className="old-title text-2xl font-black text-[#3d2b1f]">
            Movies is in development
          </DialogTitle>
          <DialogDescription className="old-body text-sm leading-relaxed text-[#6b5543]">
            This section is locked for now while we work on it. The movie experience is not
            available yet. Your other Rewind features are ready to explore.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="sk-leather old-btn rounded-lg px-4 py-2 text-xs font-bold text-[#faf6eb]"
          >
            Got it
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StarterGuideButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-7 h-7 rounded-full bg-[#d4c5a9]/50 hover:bg-[#c4956a]/30 flex items-center justify-center transition-colors cursor-pointer"
      title="Open starter guide"
      aria-label="Open Rewind starter guide"
    >
      <BookOpen className="h-3.5 w-3.5 text-[#5c4033]" />
    </button>
  );
}

export function MoviesTabIcon() {
  return (
    <span className="relative inline-flex items-center" aria-hidden="true">
      <Film className="h-4 w-4" />
      <LockKeyhole className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#f5edd6] text-[#8b5e3c]" />
    </span>
  );
}
