'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Minimize2, X, SmilePlus } from 'lucide-react';
import { getAllChatMessages, putAllChatMessages } from '@/lib/idb-store/index';

/* ═══════════════════════════════════════════════════════════════
   Retro Chat — AIM-style chat with dial-up connection animation
   ═══════════════════════════════════════════════════════════════ */

interface ChatMessage {
  id: string;
  from: 'me' | 'buddy';
  text: string;
  time: string;
  color: string;
}

const BUDDY_REPLIES = [
  "hey!! whats up?? :D",
  "omg remember when we used to stay up late chatting??",
  "haha yeah that was so fun",
  "did u watch that cartoon yesterday?? it was so good!!",
  "brb my mom is calling me for dinner",
  "back! sorry about that lol",
  "i cant believe its already 11pm... time flies when ur having fun",
  "u still have that mixtape i made u??",
  "LOL thats hilarious",
  "wanna come over tomorrow? we can play n64",
  "my dad said we can rent a movie from blockbuster!!",
  "a/s/l? lol jk",
  "brb phone is ringing... its probably jessica",
  "ok back. it was jessica. she said shes coming over too!",
  "remember that time we snuck out at night?? so scary but fun",
  "my mom made cookies!! chocolate chip :D",
  "u online?? hello??",
  "gtg its getting late. ttyl!!",
  "omg i just heard the best song on the radio",
  "check this out -> I just found the coolest website",
  "haha ur so funny",
  "wait wait wait... did u see that episode??",
  "i love these smileys :) ;) :P :D >:( 8-)",
  "summer vacation is gonna be so awesome this year!!",
  "school is almost over!!! YESSS",
  "do u have aol or msn?? add me!!",
  "my screen name is NostalgiaKid2000 add me",
  "gtg bye!! *waves*",
];

const BUDDY_NAMES = [
  { name: 'CoolDude99', color: '#ff0000' },
  { name: 'SunshineGal', color: '#ff69b4' },
  { name: 'Sk8rBoi2000', color: '#0000ff' },
  { name: 'xXDarkAngelXx', color: '#800080' },
  { name: 'PizzaLover42', color: '#008080' },
];

const DIALUP_STEPS = [
  'Initializing modem...',
  'Dialing 56K...',
  'Handshake sequence...',
  'KRRRRR BZZZT CHHHHH...',
  'Connected at 56.6 Kbps...',
  'Loading AIM...'
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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

    // Progress bar fills up
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Hide static noise after a moment
    const staticTimeout = setTimeout(() => setShowStatic(false), 1500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(staticTimeout);
    };
  }, [onComplete]);

  return (
    <div className="relative w-full h-[320px] flex flex-col items-center justify-center sk-tv-screen rounded-sm overflow-hidden">
      {/* Static noise overlay */}
      <AnimatePresence>
        {showStatic && (
          <motion.div
            initial={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\" opacity=\"0.5\"/%3E%3C/svg%3E")',
              backgroundSize: '100px 100px',
              animation: 'noise-shift 0.15s steps(3) infinite',
            }}
          />
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-64 mb-4">
        <div className="h-3 bg-[#c0c0c0] rounded-sm border border-[#808080]" style={{ boxShadow: 'inset 1px 1px #0a0a0a, inset -1px -1px #ffffff' }}>
          <div
            className="h-full bg-[#000080] transition-all duration-100"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Status text - typewriter effect */}
      <div className="text-center">
        {DIALUP_STEPS.slice(0, step + 1).map((s, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i <= step ? 1 : 0, x: 0 }}
            className="old-typewriter text-xs mb-1"
            style={{
              color: i === step ? '#000080' : '#808080',
              fontWeight: i === step ? 'bold' : 'normal',
            }}
          >
            {i === 0 ? '> ' : '  '}{s}
          </motion.p>
        ))}
      </div>

      {/* Modem sound visualization */}
      {step < 3 && (
        <div className="flex items-center gap-[2px] mt-4 h-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-[#000080] rounded-sm"
              animate={{ height: [4, Math.random() * 20 + 4, 4] }}
              transition={{ duration: 0.2 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.02 }}
            />
          ))}
        </div>
      )}

      {/* Connecting... text */}
      {step >= 3 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="old-typewriter text-sm mt-3"
          style={{ color: '#000080' }}
        >
          {step < 5 ? 'ð Establishing connection...' : 'â¨ Connected!'}
        </motion.p>
      )}
    </div>
  );
}

/* ── Main Retro Chat Component ── */
export default function RetroChatFolder() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [buddyName] = useState(() => BUDDY_NAMES[Math.floor(Math.random() * BUDDY_NAMES.length)]);
  const [statusText, setStatusText] = useState('Connecting...');
  const [showEmojis, setShowEmojis] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const myColor = '#000080';
  const emojis = [':)', ';)', ':P', ':D', ':(', '>:(', '8-)', 'O:)', ':O', '<3', 'XD', 'LOL'];

  // Load messages from IDB on first connect
  const handleConnected = useCallback(() => {
    setConnected(true);
    setStatusText('Online');
    if (!loadedRef.current) {
      loadedRef.current = true;
      getAllChatMessages()
        .then((records) => {
          setMessages((records as ChatMessage[]).slice(-50));
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Buddy auto-replies
  useEffect(() => {
    if (!connected || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.from !== 'me') return;

    const typingDelay = 800 + Math.random() * 1200;
    const replyDelay = typingDelay + 1000 + Math.random() * 1500;

    const t1 = setTimeout(() => setStatusText('typing...'), typingDelay);
    const t2 = setTimeout(() => {
      const reply = BUDDY_REPLIES[Math.floor(Math.random() * BUDDY_REPLIES.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const newMsg: ChatMessage = {
        id: generateId(),
        from: 'buddy',
        text: reply,
        time: timeStr,
        color: buddyName.color,
      };
      setMessages((prev) => {
        const updated = [...prev, newMsg];
        putAllChatMessages(updated as any).catch(() => {});
        return updated;
      });
      setStatusText('Online');
    }, replyDelay);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [messages.length, connected, buddyName.color]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newMsg: ChatMessage = {
      id: generateId(), from: 'me', text, time: timeStr, color: myColor,
    };
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      putAllChatMessages(updated as any).catch(() => {});
      return updated;
    });
    setInputText('');
    setShowEmojis(false);
  }, [inputText]);

  const insertEmoji = (emoji: string) => {
    setInputText(prev => prev + ' ' + emoji);
    setShowEmojis(false);
  };

  const clearChat = () => {
    setMessages([]);
    putAllChatMessages([]).catch(() => {});
    setStatusText('Online');
  };

  return (
    <section className="scroll-mt-8">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-sm overflow-hidden"
          style={{
            border: '2px solid',
            borderColor: '#808080 #ffffff #ffffff #808080',
            boxShadow: '2px 2px 0 #000',
          }}
        >
          {/* Window title bar - AIM style */}
          <div
            className="flex items-center justify-between px-3 py-1.5"
            style={{
              background: 'linear-gradient(180deg, #3168d5 0%, #2456b5 40%, #1a3f8a 100%)',
              borderBottom: '1px solid #000',
            }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-white/80" />
              <span style={{ fontFamily: 'Tahoma, Verdana, sans-serif', fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                AIM - Instant Message
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 text-[10px]">
                <Minimize2 className="w-3 h-3" />
              </button>
              <button className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 text-[10px]">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div
            className="flex items-center gap-1 px-2 py-1"
            style={{ background: '#c0c0c0', borderBottom: '1px solid #808080' }}
          >
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', color: '#000' }}>To:</span>
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', fontWeight: 'bold', color: buddyName.color }}>
              {buddyName.name}
            </span>
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#808080', marginLeft: '8px' }}>
              ({statusText})
            </span>
          </div>

          {/* Chat area OR Dial-up overlay */}
          {!connected ? (
            <DialUpOverlay onComplete={handleConnected} />
          ) : (
            <div
              className="relative"
              style={{
                height: '320px',
                background: '#ffffff',
                fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
                fontSize: '12px',
                overflowY: 'auto',
              }}
            >
              {messages.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#808080]">
                  <span className="text-3xl mb-2">ð¬</span>
                  <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px' }}>
                    Start a conversation with <b style={{ color: buddyName.color }}>{buddyName.name}</b>
                  </p>
                  <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#a0a0a0', marginTop: '4px' }}>
                    Type something below and hit Send
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="px-3 py-1 hover:bg-[#f0f0ff]/50" style={{ lineHeight: '1.5' }}>
                  <span style={{ fontWeight: 'bold', color: msg.color, fontSize: '12px' }}>
                    {msg.from === 'me' ? 'Me' : buddyName.name}:
                  </span>{' '}
                  <span style={{ color: '#000', fontSize: '12px' }}>{msg.text}</span>
                  <span className="ml-2" style={{ color: '#808080', fontSize: '10px' }}>{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input area - only show when connected */}
          {connected && (
            <div className="px-2 py-2" style={{ background: '#c0c0c0', borderTop: '1px solid #808080' }}>
              {/* Emoji picker */}
              <AnimatePresence>
                {showEmojis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 flex flex-wrap gap-1 p-2 overflow-hidden"
                    style={{ background: '#ffffff', border: '1px solid #808080' }}
                  >
                    {emojis.map(e => (
                      <button
                        key={e}
                        onClick={() => insertEmoji(e)}
                        className="px-1.5 py-0.5 text-sm hover:bg-[#e0e0ff] cursor-pointer"
                        style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '13px' }}
                      >
                        {e}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <div className="flex-1" style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080' }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                    placeholder="Type a message..."
                    className="w-full px-2 py-1.5 text-[12px] outline-none"
                    style={{ fontFamily: 'Tahoma, Verdana, sans-serif', background: '#ffffff', color: '#000' }}
                  />
                </div>
                <button
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="px-2 py-1.5 cursor-pointer"
                  style={{
                    background: '#c0c0c0',
                    border: '2px solid',
                    borderColor: '#ffffff #808080 #808080 #ffffff',
                    fontSize: '14px',
                  }}
                  title="Emoticons"
                >
                  <SmilePlus className="w-4 h-4 text-[#000]" />
                </button>
                <button
                  onClick={sendMessage}
                  className="px-3 py-1.5 cursor-pointer font-bold"
                  style={{
                    fontFamily: 'Tahoma, sans-serif',
                    fontSize: '11px',
                    background: 'linear-gradient(180deg, #e8e8e8, #c0c0c0)',
                    border: '2px solid',
                    borderColor: '#ffffff #808080 #808080 #ffffff',
                    color: '#000',
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div
            className="flex items-center justify-between px-3 py-1"
            style={{ background: '#c0c0c0', borderTop: '1px solid #ffffff' }}
          >
            <span style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#808080' }}>
              {connected
                ? messages.length > 0
                  ? `${messages.length} message${messages.length > 1 ? 's' : ''}`
                  : 'No messages yet'
                : 'Connecting...'}
            </span>
            {connected && messages.length > 0 && (
              <button
                onClick={clearChat}
                style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#808080', textDecoration: 'underline' }}
                className="hover:text-[#000] cursor-pointer"
              >
                Clear Chat
              </button>
            )}
          </div>
        </motion.div>

        {/* Fun AIM-era info */}
        {connected && (
          <div className="mt-4 text-center space-y-1">
            <p className="old-handwritten text-xs text-[#8b7355]">
              Chatting with <b style={{ color: buddyName.color }}>{buddyName.name}</b> on AIM
            </p>
            <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '10px', color: '#a0a0a0' }}>
              &quot;You&apos;ve Got Mail!&quot; ð¬
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
