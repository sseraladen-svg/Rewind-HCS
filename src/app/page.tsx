'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Heart, Music, Gamepad2, Film, Star, BookOpen, Monitor,
  ChevronRight, Sparkles, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  nostalgiaData, getDecadeForYear, getPersonalTimeline,
  type DecadeData, type NostalgiaItem,
} from '@/lib/nostalgia-data';
/* eslint-disable @next/next/no-page-custom-font */

/* ───────────── tiny floating particles (pure CSS) ───────────── */
function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full opacity-20 animate-[float_20s_infinite_linear]"
          style={{
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: ['#D2691E', '#FF1493', '#00CED1', '#7B68EE', '#FF6347'][i % 5],
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 15}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────── hero / landing ───────────── */
function HeroSection({ onSubmit }: { onSubmit: (year: number) => void }) {
  const [year, setYear] = useState('');
  const [hoveredDecade, setHoveredDecade] = useState<string | null>(null);

  const handleSubmit = () => {
    const y = parseInt(year);
    if (y >= 1970 && y <= 2019) onSubmit(y);
  };

  const decades = Object.values(nostalgiaData);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 z-10"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl md:text-7xl mb-4"
        >
          📼
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3 bg-gradient-to-r from-amber-600 via-rose-500 to-violet-500 bg-clip-text text-transparent">
          Rewind
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
          Take a trip back to the days when life was simple. Remember who you were before the world told you who to be.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="z-10 w-full max-w-sm"
      >
        <Card className="border-2 border-amber-200/50 bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-100/30">
          <CardContent className="p-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2 text-center">
              When were you born?
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1970}
                max={2019}
                placeholder="e.g. 1992"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1 text-center text-2xl font-bold rounded-lg border-2 border-amber-200 focus:border-amber-400 focus:outline-none p-3 bg-white/60 transition-colors"
                aria-label="Birth year"
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold text-lg py-6 rounded-xl shadow-lg shadow-amber-200/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-300/50 hover:scale-[1.02] active:scale-95"
            >
              <Clock className="mr-2 h-5 w-5" />
              Take Me Back
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              1970 – 2019 &nbsp;·&nbsp; Your memories, your era
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Decade preview chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap justify-center gap-3 mt-10 z-10 max-w-lg"
      >
        {decades.map((d) => (
          <motion.button
            key={d.decade}
            onMouseEnter={() => setHoveredDecade(d.decade)}
            onMouseLeave={() => setHoveredDecade(null)}
            onClick={() => {
              const y = parseInt(d.years.split('–')[0]);
              setYear(String(y));
              onSubmit(y);
            }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 cursor-pointer"
            style={{
              borderColor: hoveredDecade === d.decade ? d.color : 'transparent',
              backgroundColor: hoveredDecade === d.decade ? `${d.color}15` : 'rgba(255,255,255,0.5)',
              color: hoveredDecade === d.decade ? d.color : 'var(--foreground)',
              boxShadow: hoveredDecade === d.decade ? `0 4px 20px ${d.color}30` : 'none',
            }}
          >
            {d.decade}
          </motion.button>
        ))}
      </motion.div>

      {/* Emotional message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-muted-foreground text-sm mt-8 z-10 max-w-sm"
      >
        Everybody is running for jobs, money, markets… but you&apos;re still <span className="font-semibold text-amber-600">human</span>. Take a breath. Remember the good days.
      </motion.p>
    </div>
  );
}

/* ───────────── nostalgic quote banner ───────────── */
function QuoteBanner({ quotes }: { quotes: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 8000);
    return () => clearInterval(t);
  }, [quotes.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center text-base md:text-lg italic text-amber-800/80 dark:text-amber-200/80 px-4 py-3"
      >
        &ldquo;{quotes[idx]}&rdquo;
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────── memory card ───────────── */
function MemoryCard({ item, color, index }: { item: NostalgiaItem; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group h-full border border-transparent hover:border-amber-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-100/20 hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              {item.emoji}
            </span>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-foreground leading-tight">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ───────────── category tab content ───────────── */
function CategoryGrid({ items, color }: { items: NostalgiaItem[]; color: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, i) => (
        <MemoryCard key={item.title} item={item} color={color} index={i} />
      ))}
    </div>
  );
}

/* ───────────── personal timeline ───────────── */
function PersonalTimeline({ birthYear, onDecadeClick }: { birthYear: number; onDecadeClick: (d: string) => void }) {
  const timeline = getPersonalTimeline(birthYear);

  return (
    <div className="space-y-4">
      {timeline.map((entry, i) => {
        const data = nostalgiaData[entry.decade];
        return (
          <motion.div
            key={entry.decade}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <button
              onClick={() => onDecadeClick(entry.decade)}
              className="w-full text-left cursor-pointer group"
            >
              <Card className="border border-amber-100/50 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-md">
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: data.color }}
                  >
                    {entry.age.replace('Age ', '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{entry.decade}</span>
                      <Badge variant="secondary" className="text-xs">{entry.age}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.label}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────── era spotlight (featured item) ───────────── */
function EraSpotlight({ data }: { data: DecadeData }) {
  const [spotIdx, setSpotIdx] = useState(0);
  const allItems = [
    ...data.cartoons, ...data.toys, ...data.music, ...data.movies,
    ...data.snacks, ...data.games, ...data.trends, ...data.schoolLife, ...data.tech,
  ];
  const spot = allItems[spotIdx % allItems.length];

  useEffect(() => {
    const t = setInterval(() => setSpotIdx((i) => i + 1), 5000);
    return () => clearInterval(t);
  }, [allItems.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={spotIdx}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 overflow-hidden" style={{ borderColor: `${data.color}40` }}>
          <div className="h-32 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${data.color}20, ${data.color}10)` }}>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl"
            >
              {spot.emoji}
            </motion.span>
          </div>
          <CardContent className="p-5">
            <Badge variant="outline" className="mb-2 text-xs" style={{ borderColor: data.color, color: data.color }}>
              {spot.category} &middot; {data.decade}
            </Badge>
            <h3 className="text-xl font-bold">{spot.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{spot.description}</p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────── breather / relief message ───────────── */
function BreatherMessage() {
  const messages = [
    { title: "You're doing great", body: "The fact that you're here, remembering the simple times, means you still have that spark. Life gets heavy — that's okay. Take it one day at a time." },
    { title: "You were enough then", body: "Back when your biggest worry was getting home before dark. You didn't need to prove anything. You were enough just being you. You still are." },
    { title: "Slow down", body: "The world tells you to hustle, grind, achieve. But some of the best moments of your life happened when you were doing absolutely nothing. Remember that." },
    { title: "You're still that kid", body: "Inside every stressed adult is a kid who lit up at the sound of the ice cream truck, who believed in magic, who laughed until their stomach hurt. That kid is still in you." },
    { title: "Breathe", body: "Close your eyes. Take a deep breath. You've survived 100% of your worst days. You're stronger than you think, and it's okay to rest." },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 12000);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.6 }}
        className="text-center py-6 px-4"
      >
        <Sparkles className="h-6 w-6 mx-auto mb-3 text-amber-500" />
        <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300">{messages[idx].title}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">{messages[idx].body}</p>
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────── main dashboard ───────────── */
function Dashboard({ birthYear, onBack }: { birthYear: number; onBack: () => void }) {
  const decadeKey = getDecadeForYear(birthYear);
  const data = nostalgiaData[decadeKey];
  const timeline = getPersonalTimeline(birthYear);
  const [activeTab, setActiveTab] = useState('all');
  const categoryMap: Record<string, { label: string; icon: React.ReactNode; items: NostalgiaItem[] }> = {
    cartoons: { label: 'Cartoons', icon: <Film className="h-4 w-4" />, items: data.cartoons },
    toys: { label: 'Toys', icon: <Star className="h-4 w-4" />, items: data.toys },
    music: { label: 'Music', icon: <Music className="h-4 w-4" />, items: data.music },
    movies: { label: 'Movies', icon: <Film className="h-4 w-4" />, items: data.movies },
    snacks: { label: 'Snacks', icon: <Heart className="h-4 w-4" />, items: data.snacks },
    games: { label: 'Games', icon: <Gamepad2 className="h-4 w-4" />, items: data.games },
    trends: { label: 'Trends', icon: <Sparkles className="h-4 w-4" />, items: data.trends },
    school: { label: 'School Life', icon: <BookOpen className="h-4 w-4" />, items: data.schoolLife },
    tech: { label: 'Tech', icon: <Monitor className="h-4 w-4" />, items: data.tech },
  };

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-amber-100/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <h2 className="font-bold text-lg">
              <span className="bg-gradient-to-r from-amber-600 to-rose-500 bg-clip-text text-transparent">Rewind</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1" style={{ borderColor: data.color, color: data.color }}>
              {data.decade} &middot; Born {birthYear}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-20">
        {/* Hero banner */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-8 pb-6"
        >
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: data.color }}>
              {data.decade}
            </h1>
            <p className="text-muted-foreground">{data.tagline}</p>
          </div>
          <QuoteBanner quotes={data.quotes} />
        </motion.section>

        {/* Personal timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Your Timeline
          </h2>
          <PersonalTimeline
            birthYear={birthYear}
            onDecadeClick={(d) => {
              if (d === decadeKey) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        </motion.section>

        {/* Breather message */}
        <BreatherMessage />

        {/* Era spotlight */}
        <section className="mb-10 mt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Remember This?
          </h2>
          <EraSpotlight data={data} />
        </section>

        {/* Category tabs */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Explore Your Era
          </h2>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollArea className="w-full -mb-px">
              <TabsList className="inline-flex w-max gap-1 p-1 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm px-3 md:px-4">
                  All
                </TabsTrigger>
                {Object.entries(categoryMap).map(([key, cat]) => (
                  <TabsTrigger key={key} value={key} className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm px-3 md:px-4 flex items-center gap-1.5">
                    {cat.icon}
                    <span className="hidden sm:inline">{cat.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            <TabsContent value="all" className="mt-6">
              {Object.entries(categoryMap).map(([key, cat]) => (
                <div key={key} className="mb-8 last:mb-0">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    {cat.icon} {cat.label}
                  </h3>
                  <CategoryGrid items={cat.items} color={data.color} />
                </div>
              ))}
            </TabsContent>

            {Object.entries(categoryMap).map(([key, cat]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <CategoryGrid items={cat.items} color={data.color} />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Final message */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-10"
        >
          <div className="max-w-md mx-auto">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-4"
            >
              🫂
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-2">You made it through.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every memory on this page is a piece of who you are. The world moves fast, but your roots are deep. You came from simpler times, and that strength lives in you still. Take care of yourself.
            </p>
            <Button
              variant="outline"
              className="mt-6 border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => {
                const btn = document.querySelector('[data-rewind-top]') as HTMLElement | null;
                btn?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-100/50 bg-white/50 dark:bg-black/30 backdrop-blur-sm mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Rewind — because you&apos;re human, not a machine. Take it easy.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ───────────── app root ───────────── */
export default function Home() {
  const [birthYear, setBirthYear] = useState<number | null>(null);

  const handleSubmit = useCallback((year: number) => {
    setBirthYear(year);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBack = useCallback(() => {
    setBirthYear(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/80 via-white to-rose-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" data-rewind-top>
      <AnimatePresence mode="wait">
        {birthYear === null ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <HeroSection onSubmit={handleSubmit} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard birthYear={birthYear} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}