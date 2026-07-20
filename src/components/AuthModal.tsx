'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: { name: string; email: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setEmail('');
    setName('');
    setPassword('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const switchMode = () => {
    reset();
    setMode(prev => prev === 'login' ? 'register' : 'login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }
        // Auto-login after registration
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(mode === 'login' ? 'Invalid email or password' : 'Login failed after registration');
        setLoading(false);
        return;
      }

      onAuthSuccess?.({ name: name || email.split('@')[0], email });
      handleClose();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-sm sk-paper rounded-2xl p-6 sk-noise relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tape decoration */}
            <div className="sk-tape absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-6 -rotate-1" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/60 flex items-center justify-center hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4 text-[#5c4033]" />
            </button>

            <div className="text-center mb-5">
              <div className="text-3xl mb-2">{mode === 'login' ? '🔐' : '✨'}</div>
              <h2 className="old-title text-xl font-black text-[#3d2b1f]">
                {mode === 'login' ? 'Welcome Back' : 'Join Rewind'}
              </h2>
              <p className="old-body text-xs text-[#8b7355] mt-1">
                {mode === 'login'
                  ? 'Sign in to save your memories across devices'
                  : 'Create an account to keep your memories safe'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b7355]" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="sk-inset w-full pl-10 pr-4 py-2.5 rounded-lg old-body text-sm text-[#3d2b1f] placeholder:text-[#a08868] focus:outline-none focus:ring-2 focus:ring-[#c4956a]/40"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b7355]" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="sk-inset w-full pl-10 pr-4 py-2.5 rounded-lg old-body text-sm text-[#3d2b1f] placeholder:text-[#a08868] focus:outline-none focus:ring-2 focus:ring-[#c4956a]/40"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b7355]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="sk-inset w-full pl-10 pr-10 py-2.5 rounded-lg old-body text-sm text-[#3d2b1f] placeholder:text-[#a08868] focus:outline-none focus:ring-2 focus:ring-[#c4956a]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7355] hover:text-[#5c4033] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-600 font-medium text-center old-body"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="sk-btn old-btn w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-t border-[#d4c5a9]/50">
              <button
                onClick={switchMode}
                className="old-body text-xs text-[#8b7355] hover:text-[#5c4033] transition-colors cursor-pointer"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}