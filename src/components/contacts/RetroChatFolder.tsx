'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Minimize2, X, SmilePlus, Users, ChevronLeft, User, Volume2, VolumeX, Search } from 'lucide-react';
import { getAllChatMessages, putAllChatMessages } from '@/lib/idb-store/index';
import { soundAimDoorOpen, soundAimMessage, soundButtonClick, soundTypewriterKey } from '@/lib/sounds';

/* ══════════════════════════════════════════════════════════════════
   Retro Chat - Enhanced AIM-style chat with buddy list
   ═════════════════════════════════════════════════════════════════ */

interface ChatMessage {
  id: string;
  from: 'me' | 'buddy';
  buddyName: string;
  text: string;
  time: string;
  color: string;
}

interface Buddy {
  name: string;
  color: string;
  status: 'online' | 'away' | 'idle';
  profile: string;
  awayMsg: string;
}

const BUDDIES: Buddy[] = [
  { name: 'CoolDude99', color: '#ff0000', status: 'online', profile: 'Loves skateboarding and punk rock. Has every blink-182 CD.', awayMsg: '' },
  { name: 'SunshineGal', color: '#ff69b4', status: 'online', profile: 'BFF since 3rd grade. Loves NSYNC and Lisa Frank stickers.', awayMsg: '' },
  { name: 'Sk8rBoi2000', color: '#0000ff', status: 'away', profile: 'Skater dude. Has every Tony Hawk game. Can kickflip.', awayMsg: 'away - skating at the park' },
  { name: 'xXDarkAngelXx', color: '#800080', status: 'online', profile: 'Gothic poetry writer. Loves The Craft and Nirvana.', awayMsg: '' },
  { name: 'PizzaLover42', color: '#008080', status: 'idle', profile: 'Will eat pizza anytime, anywhere. Pepperoni purist.', awayMsg: 'idle - probably eating pizza' },
];

const KEYWORD_REPLIES: Record<string, string[]> = {
  'hello|hey|hi|sup': ['hey!! whats up?? :D', 'heyyy!! long time no see!', 'yo!! how have you been??'],
  'school|homework|class': ['ugh school... i have so much homework too', 'did u finish the math worksheet??', 'school is literally the worst lol'],
  'movie|film|watch': ['omg did u see that new movie?? it was SO good', 'wanna rent a movie from blockbuster this weekend??', 'my dad said we can rent a movie!!'],
  'game|play|n64|ps1': ['i just got the new mario game!! its amazing', 'wanna come over and play n64??', 'i beat the final boss last night!! took me 3 tries lol'],
  'music|song|cd|tape': ['have u heard the new song?? its so good', 'i made u a new mixtape!!', 'my walkman is playing up again :('],
  'food|pizza|lunch|dinner': ['pizza sounds so good right now', 'my mom is making cookies!! chocolate chip :D', 'brb my mom is calling for dinner'],
  'love|crush|like': ['oohh who do u like?? tell me tell me', 'crushes are so stressful lol', 'i think someone likes you... just saying ;)'],
  'bye|gtg|gotta|later': ['aww ok bye!! ttyl!!', 'gtg too!! talk to u later!!', 'bye!! dont forget to add me on AIM!!'],
  'lol|haha|funny': ['LOL that is hilarious', 'hahahaha ur so funny', 'im literally dying laughing right now'],
  'computer|internet|web|aol': ['my internet is so slow today... stupid dial-up', 'i just found the coolest website!!', 'do u have aol?? add me!!'],
  'default': ['thats so cool!!', 'haha yeah totally', 'omg same!!', 'no way!! thats awesome', 'tell me more!!', 'lol nice', 'thats what im saying!!', 'u always have the best stories', 'i was just thinking the same thing', 'we should totally do that this weekend', 'brb phone is ringing', 'back! sorry about that lol', 'my mom made cookies!!', 'wanna come over tomorrow??', 'a/s/l? lol jk'],
};

const DIALUP_STEPS = [
  'Initializing modem...',
  'Dialing 56K...',
  'Handshake sequence...',
  'KRRRRR BZZZT CHHHHH...',
  'Connected at 56.6 Kbps...',
  'Loading AIM...'
];

const CHAT_ROOM_MESSAGES = [
  { name: 'MusicFan88', text: 'has anyone heard the new blink-182 album??' },
  { name: 'GamerKid01', text: 'goldeneye tonight?? i call oddjob' },
  { name: 'RetroQueen', text: 'just watched Titanic for the 5th time. still crying.' },
  { name: 'SkaterDude', text: 'who is going to the skate park tomorrow?' },
  { name: 'BookWorm99', text: 'reading harry potter for the 3rd time lol' },
  { name: 'PopCulture02', text: 'did anyone watch friends last night?? so funny' },
  { name: 'MusicFan88', text: 'my walkman just ate my favorite tape... RIP' },
  { name: 'GamerKid01', text: 'final fantasy 7 is the greatest game ever made. fight me.' },
  { name: 'RetroQueen', text: ' blockbuster is literally the best place on earth' },
  { name: 'SkaterDude', text: 'just learned a new kickflip!! stoked' },
  { name: 'BookWorm99', text: 'the new goosebumps book is so scary' },
  { name: 'PopCulture02', text: 'aol is being so slow today ugh' },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function pickReply(userText: string): string {
  const lower = userText.toLowerCase();
  for (const [keys, replies] of Object.entries(KEYWORD_REPLIES)) {
    if (keys === 'default') continue;
    const patterns = keys.split('|');
    if (patterns.some(p => lower.includes(p))) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  const defaults = KEYWORD_REPLIES['default'];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function getTimeStr(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/* ── Dial-up Connection Overlay ── */
function DialUpOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showStatic, setShowStatic] = useState(true);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => {
        if (prev >= DIALUP_STEPS.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => onComplete(), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(progressInterval); return 100; }
        return prev + 2;
      });
    }, 50);
    const staticTimeout = setTimeout(() => setShowStatic(false), 1500);
    return () => { clearInterval(stepInterval); clearInterval(progressInterval); clearTimeout(staticTimeout); };
  }, [onComplete]);

  return (
    <div className="relative w-full h-[320px] flex flex-col items-center justify-center sk-tv-screen rounded-sm overflow-hidden">
      <AnimatePresence>
        {showStatic && (
          <motion.div
            initial={{ opacity: 0.7 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\" opacity=\"0.5\"/%3E%3C/svg%3E")',
              backgroundSize: '100px 100px',
              animation: 'noise-shift 0.15s steps(3) infinite',
            }}
          />
        )}
      </AnimatePresence>
      <div className="w-64 mb-4">
        <div className="h-3 bg-[#c0c0c0] rounded-sm border border-[#808080]" style={{ boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff' }}>
          <div className="h-full bg-[#000080] transition-all duration-100" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>
      <div className="text-center">
        {DIALUP_STEPS.slice(0, step + 1).map((s, i) => (
          <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= step ? 1 : 0, x: 0 }}
            className="old-typewriter text-xs mb-1"
            style={{ color: i === step ? '#000080' : '#808080', fontWeight: i === step ? 'bold' : 'normal' }}
          >
            {i === 0 ? '> ' : '  '}{s}
          </motion.p>
        ))}
      </div>
      {step < 3 && (
        <div className="flex items-center gap-[2px] mt-4 h-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div key={i} className="w-1 bg-[#000080] rounded-sm"
              animate={{ height: [4, Math.random() * 20 + 4, 4] }}
              transition={{ duration: 0.2 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.02 }}
            />
          ))}
        </div>
      )}
      {step >= 3 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="old-typewriter text-sm mt-3" style={{ color: '#000080' }}
        >
          {step < 5 ? 'Establishing connection...' : 'Connected!'}
        </motion.p>
      )}
    </div>
  );
}

/* ── Chat Room ── */
function ChatRoom({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ name: string; text: string; time: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgIdxRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = CHAT_ROOM_MESSAGES[msgIdxRef.current % CHAT_ROOM_MESSAGES.length];
      msgIdxRef.current++;
      setMessages(prev => [...prev.slice(-50), { ...msg, time: getTimeStr() }]);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { name: 'Me', text: inputText.trim(), time: getTimeStr() }]);
    setInputText('');
  };

  return (
    <div className="sk-paper rounded-sm overflow-hidden" style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', boxShadow: '2px 2px 0 #000' }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: 'linear-gradient(180deg, #3168d5 0%, #2456b5 40%, #1a3f8a 100%)', borderBottom: '1px solid #000' }}>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-white/80" />
          <span style={{ fontFamily: 'Tahoma, Verdana, sans-serif', fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>AIM Chat Room - 90s Nostalgia Lounge</span>
        </div>
        <button onClick={() => { soundButtonClick(); onClose(); }} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 cursor-pointer"><X className="w-3 h-3" /></button>
      </div>
      {/* Room info */}
      <div className="px-3 py-1 text-center" style={{ background: '#c0c0c0', borderBottom: '1px solid #808080' }}>
        <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#000' }}>Users in room: MusicFan88, GamerKid01, RetroQueen, SkaterDude, BookWorm99, PopCulture02, + You</span>
      </div>
      {/* Messages */}
      <div className="overflow-y-auto" style={{ height: '250px', background: '#ffffff', fontFamily: 'Tahoma, Verdana, Arial, sans-serif', fontSize: '12px' }}>
        {messages.map((msg, i) => (
          <div key={i} className="px-3 py-0.5 hover:bg-[#f0f0ff]/50" style={{ lineHeight: '1.5' }}>
            <span style={{ color: msg.name === 'Me' ? '#000080' : '#8b0000', fontWeight: 'bold', fontSize: '11px' }}>{msg.name}: </span>
            <span style={{ color: '#000', fontSize: '12px' }}>{msg.text}</span>
            <span className="ml-2" style={{ color: '#808080', fontSize: '9px' }}>{msg.time}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {/* Input */}
      <div className="px-2 py-2" style={{ background: '#c0c0c0', borderTop: '1px solid #808080' }}>
        <div className="flex items-center gap-2">
          <div className="flex-1" style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080' }}>
            <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type a message..." className="w-full px-2 py-1.5 text-[12px] outline-none" style={{ fontFamily: 'Tahoma, Verdana, sans-serif', background: '#ffffff', color: '#000' }} />
          </div>
          <button onClick={handleSend} className="px-3 py-1.5 cursor-pointer font-bold"
            style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', background: 'linear-gradient(180deg, #e8e8e8, #c0c0c0)', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', color: '#000' }}>Send</button>
        </div>
      </div>
    </div>
  );
}

/* ── Buddy Profile Popup ── */
function BuddyProfile({ buddy, onClose }: { buddy: Buddy; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="absolute top-10 right-2 z-20 w-56 sk-paper rounded-sm p-3 sk-noise" style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', boxShadow: '3px 3px 0 #000' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: buddy.color }}>{buddy.name[0]}</div>
          <div>
            <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '12px', fontWeight: 'bold', color: buddy.color }}>{buddy.name}</p>
            <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '9px', color: buddy.status === 'online' ? '#008000' : '#808080' }}>{buddy.status === 'online' ? 'Online' : buddy.status === 'away' ? 'Away' : 'Idle'}</p>
          </div>
        </div>
        <button onClick={() => { soundButtonClick(); onClose(); }} className="text-[#808080] hover:text-black cursor-pointer"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="sk-inset rounded-sm p-2 mb-2">
        <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#333' }}>{buddy.profile}</p>
      </div>
      {buddy.awayMsg && <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '9px', color: '#808080', fontStyle: 'italic' }}>"{buddy.awayMsg}"</p>}
    </motion.div>
  );
}

/* ── Main Retro Chat Component ── */
export default function RetroChatFolder() {
  const [connected, setConnected] = useState(false);
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeBuddy, setActiveBuddy] = useState(BUDDIES[0]);
  const [inputText, setInputText] = useState('');
  const [statusText, setStatusText] = useState('Connecting...');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showBuddyList, setShowBuddyList] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSoundWave, setShowSoundWave] = useState(false);
  const [searchBuddy, setSearchBuddy] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const myColor = '#000080';
  const emojis = [':)', ';)', ':P', ':D', ':(', '>:(', '8-)', 'O:)', ':O', '<3', 'XD', 'LOL'];

  const currentMessages = allMessages[activeBuddy.name] || [];

  const handleConnected = useCallback(() => {
    setConnected(true);
    setStatusText('Online');
    if (!loadedRef.current) {
      loadedRef.current = true;
      getAllChatMessages().then((records: any[]) => {
        const byBuddy: Record<string, ChatMessage[]> = {};
        for (const r of records) {
          const bName = r.buddyName || BUDDIES[0].name;
          if (!byBuddy[bName]) byBuddy[bName] = [];
          byBuddy[bName].push(r as ChatMessage);
        }
        setAllMessages(byBuddy);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages]);

  // Buddy auto-replies with keyword matching
  useEffect(() => {
    if (!connected || currentMessages.length === 0) return;
    const lastMsg = currentMessages[currentMessages.length - 1];
    if (lastMsg.from !== 'me' || lastMsg.buddyName !== activeBuddy.name) return;
    if (activeBuddy.status !== 'online') return;

    const typingDelay = 800 + Math.random() * 1200;
    const replyDelay = typingDelay + 1000 + Math.random() * 1500;

    const t1 = setTimeout(() => setStatusText('typing...'), typingDelay);
    const t2 = setTimeout(() => {
      const reply = pickReply(lastMsg.text);
      const newMsg: ChatMessage = {
        id: generateId(), from: 'buddy', buddyName: activeBuddy.name, text: reply, time: getTimeStr(), color: activeBuddy.color,
      };
      setAllMessages(prev => {
        const buddyMsgs = [...(prev[activeBuddy.name] || []), newMsg];
        const updated = { ...prev, [activeBuddy.name]: buddyMsgs };
        putAllChatMessages(Object.values(updated).flat() as any).catch(() => {});
        return updated;
      });
      setStatusText('Online');
      soundAimMessage();
      if (soundEnabled) { setShowSoundWave(true); setTimeout(() => setShowSoundWave(false), 800); }
    }, replyDelay);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [currentMessages.length, connected, activeBuddy, soundEnabled]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    soundTypewriterKey();
    const newMsg: ChatMessage = { id: generateId(), from: 'me', buddyName: activeBuddy.name, text, time: getTimeStr(), color: myColor };
    setAllMessages(prev => {
      const buddyMsgs = [...(prev[activeBuddy.name] || []), newMsg];
      const updated = { ...prev, [activeBuddy.name]: buddyMsgs };
      putAllChatMessages(Object.values(updated).flat() as any).catch(() => {});
      return updated;
    });
    setInputText('');
    setShowEmojis(false);
  }, [inputText, activeBuddy]);

  const insertEmoji = (emoji: string) => { setInputText(prev => prev + ' ' + emoji); setShowEmojis(false); };

  const clearCurrentChat = () => {
    setAllMessages(prev => {
      const updated = { ...prev, [activeBuddy.name]: [] };
      putAllChatMessages(Object.values(updated).flat() as any).catch(() => {});
      return updated;
    });
  };

  const filteredBuddies = BUDDIES.filter(b => b.name.toLowerCase().includes(searchBuddy.toLowerCase()));
  const totalUnread = Object.entries(allMessages).reduce((acc, [name, msgs]) => {
    if (name === activeBuddy.name) return acc;
    const last = msgs[msgs.length - 1];
    return acc + (last?.from === 'buddy' ? 1 : 0);
  }, 0);

  return (
    <section className="scroll-mt-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-sm overflow-hidden" style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', boxShadow: '2px 2px 0 #000' }}>

          {/* Window title bar */}
          <div className="flex items-center justify-between px-3 py-1.5" style={{ background: 'linear-gradient(180deg, #3168d5 0%, #2456b5 40%, #1a3f8a 100%)', borderBottom: '1px solid #000' }}>
            <div className="flex items-center gap-2">
              <button onClick={() => { soundButtonClick(); setShowBuddyList(!showBuddyList); }} className="sm:hidden w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <MessageSquare className="w-3.5 h-3.5 text-white/80" />
              <span style={{ fontFamily: 'Tahoma, Verdana, sans-serif', fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>AIM - Instant Message</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowChatRoom(!showChatRoom)} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 cursor-pointer" title="Chat Rooms"><Users className="w-3 h-3" /></button>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 cursor-pointer" title="Toggle sounds">
                {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              </button>
              <button className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 cursor-pointer"><Minimize2 className="w-3 h-3" /></button>
              <button className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          </div>

          {/* Content area */}
          {!connected ? (
            <DialUpOverlay onComplete={handleConnected} />
          ) : showChatRoom ? (
            <ChatRoom onClose={() => { soundButtonClick(); setShowChatRoom(false); }} />
          ) : (
            <div className="flex" style={{ height: '380px' }}>
              {/* Buddy list sidebar */}
              <AnimatePresence>
                {showBuddyList && (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 170, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden flex-shrink-0" style={{ borderRight: '1px solid #808080', background: '#e8e8e8' }}>
                    <div className="w-[170px] flex flex-col h-full">
                      {/* Search */}
                      <div className="p-1.5" style={{ borderBottom: '1px solid #c0c0c0' }}>
                        <div className="flex items-center gap-1 px-1 py-0.5" style={{ background: '#fff', border: '1px solid #808080' }}>
                          <Search className="w-3 h-3 text-[#808080]" />
                          <input type="text" value={searchBuddy} onChange={e => setSearchBuddy(e.target.value)} placeholder="Search..." className="flex-1 text-[10px] outline-none bg-transparent" style={{ fontFamily: 'Tahoma, sans-serif', color: '#000' }} />
                        </div>
                      </div>
                      {/* Buddy list */}
                      <div className="flex-1 overflow-y-auto py-1">
                        {filteredBuddies.map(buddy => {
                          const isActive = buddy.name === activeBuddy.name;
                          const buddyMsgs = allMessages[buddy.name] || [];
                          const lastBuddyMsg = buddyMsgs.filter(m => m.from === 'buddy').length > 0;
                          const unread = isActive ? 0 : (buddyMsgs.length > 0 && buddyMsgs[buddyMsgs.length - 1].from === 'buddy' ? 1 : 0);
                          return (
                            <button key={buddy.name} onClick={() => { soundAimDoorOpen(); setActiveBuddy(buddy); setShowProfile(false); }}
                              className={`w-full text-left px-2 py-1.5 flex items-center gap-2 transition-colors cursor-pointer ${isActive ? 'bg-[#000080]/10' : 'hover:bg-[#000080]/5'}`}>
                              <div className="relative flex-shrink-0">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: buddy.color }}>{buddy.name[0]}</div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${buddy.status === 'online' ? 'bg-green-500' : buddy.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate" style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', fontWeight: isActive ? 'bold' : 'normal', color: buddy.color }}>{buddy.name}</p>
                                <p className="truncate" style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '9px', color: '#808080' }}>{buddy.status === 'online' ? 'Online' : buddy.awayMsg || buddy.status}</p>
                              </div>
                              {unread > 0 && <div className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">{unread}</div>}
                            </button>
                          );
                        })}
                      </div>
                      {/* Online count */}
                      <div className="px-2 py-1" style={{ borderTop: '1px solid #c0c0c0', background: '#d0d0d0' }}>
                        <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '9px', color: '#808080' }}>{BUDDIES.filter(b => b.status === 'online').length}/{BUDDIES.length} online</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat area */}
              <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Toolbar with buddy info */}
                <div className="flex items-center gap-1 px-2 py-1" style={{ background: '#c0c0c0', borderBottom: '1px solid #808080' }}>
                  <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', color: '#000' }}>To:</span>
                  <button onClick={() => setShowProfile(!showProfile)} className="cursor-pointer" style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', fontWeight: 'bold', color: activeBuddy.color }}>{activeBuddy.name}</button>
                  <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: activeBuddy.status === 'online' ? '#008000' : '#808080' }}>({statusText})</span>
                  {showSoundWave && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-[1px] ml-auto">
                      {[12, 8, 14, 6, 10].map((h, i) => (
                        <motion.div key={i} className="w-[2px] bg-[#000080] rounded-sm" animate={{ height: [2, h, 2] }} transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }} />
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Buddy profile popup */}
                <AnimatePresence>
                  {showProfile && <BuddyProfile buddy={activeBuddy} onClose={() => { soundButtonClick(); setShowProfile(false); }} />}
                </AnimatePresence>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto relative" style={{ background: '#ffffff', fontFamily: 'Tahoma, Verdana, Arial, sans-serif', fontSize: '12px' }}>
                  {currentMessages.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#808080]">
                      <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                      <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px' }}>Start a conversation with <b style={{ color: activeBuddy.color }}>{activeBuddy.name}</b></p>
                      <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#a0a0a0', marginTop: '4px' }}>Type something below and hit Send</p>
                    </div>
                  )}
                  {currentMessages.map(msg => (
                    <div key={msg.id} className="px-3 py-1 hover:bg-[#f0f0ff]/50" style={{ lineHeight: '1.5' }}>
                      <span style={{ fontWeight: 'bold', color: msg.color, fontSize: '12px' }}>{msg.from === 'me' ? 'Me' : msg.buddyName}:</span>{' '}
                      <span style={{ color: '#000', fontSize: '12px' }}>{msg.text}</span>
                      <span className="ml-2" style={{ color: '#808080', fontSize: '10px' }}>{msg.time}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <div className="px-2 py-2" style={{ background: '#c0c0c0', borderTop: '1px solid #808080' }}>
                  <AnimatePresence>
                    {showEmojis && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 flex flex-wrap gap-1 p-2 overflow-hidden" style={{ background: '#ffffff', border: '1px solid #808080' }}>
                        {emojis.map(e => (
                          <button key={e} onClick={() => insertEmoji(e)} className="px-1.5 py-0.5 text-sm hover:bg-[#e0e0ff] cursor-pointer" style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '13px' }}>{e}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center gap-2">
                    <div className="flex-1" style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080' }}>
                      <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                        placeholder="Type a message..." className="w-full px-2 py-1.5 text-[12px] outline-none" style={{ fontFamily: 'Tahoma, Verdana, sans-serif', background: '#ffffff', color: '#000' }} />
                    </div>
                    <button onClick={() => setShowEmojis(!showEmojis)} className="px-2 py-1.5 cursor-pointer" style={{ background: '#c0c0c0', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff' }} title="Emoticons">
                      <SmilePlus className="w-4 h-4 text-[#000]" />
                    </button>
                    <button onClick={sendMessage} className="px-3 py-1.5 cursor-pointer font-bold" style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', background: 'linear-gradient(180deg, #e8e8e8, #c0c0c0)', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', color: '#000' }}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-3 py-1" style={{ background: '#c0c0c0', borderTop: '1px solid #ffffff' }}>
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#808080' }}>
              {connected ? (showChatRoom ? 'Chat Room' : currentMessages.length > 0 ? `${currentMessages.length} message${currentMessages.length > 1 ? 's' : ''} with ${activeBuddy.name}` : `Chatting with ${activeBuddy.name}`) : 'Connecting...'}
            </span>
            <div className="flex items-center gap-3">
              {connected && !showChatRoom && currentMessages.length > 0 && (
                <button onClick={clearCurrentChat} style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#808080', textDecoration: 'underline' }} className="hover:text-[#000] cursor-pointer">Clear Chat</button>
              )}
              {connected && !showChatRoom && (
                <button onClick={() => setShowChatRoom(true)} style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#000080', textDecoration: 'underline' }} className="hover:text-[#0000cc] cursor-pointer">Chat Rooms</button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info text */}
        {connected && !showChatRoom && (
          <div className="mt-4 text-center space-y-1">
            <p className="old-handwritten text-xs text-[#8b7355]">
              Chatting with <b style={{ color: activeBuddy.color }}>{activeBuddy.name}</b> on AIM
            </p>
            <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#a0a0a0' }}>
              &quot;You've Got Mail!&quot;
            </p>
          </div>
        )}
      </div>
    </section>
  );
}