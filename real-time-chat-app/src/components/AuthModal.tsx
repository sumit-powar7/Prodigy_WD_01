import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Sparkles, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC = () => {
  const { login, theme } = useChat();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalUsername = username.trim() || name.toLowerCase().replace(/\s+/g, '_');
    login(name.trim(), finalUsername, selectedAvatar);
  };

  const handleGuestSignIn = () => {
    const randomGuestId = Math.floor(1000 + Math.random() * 9000);
    const guestName = `Guest_${randomGuestId}`;
    const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    login(guestName, `guest_${randomGuestId}`, randomAvatar);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-900/60'} backdrop-blur-md`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${
          theme === 'dark'
            ? 'border-slate-800 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-800'
        }`}
      >
        {/* Banner Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-md">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Nexus Workspace</h2>
              <p className="text-xs text-indigo-100">Real-time messaging & WebSocket engine</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Choose Avatar
            </label>
            <div className="flex items-center justify-between gap-2">
              {PRESET_AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative h-12 w-12 overflow-hidden rounded-full border-2 transition-all ${
                    selectedAvatar === avatar
                      ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={avatar} alt="Avatar option" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-950/60 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      : 'border-slate-300 bg-slate-50 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Username (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. @alex_m"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full rounded-xl border py-2.5 px-4 text-sm font-medium outline-none transition-all ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-950/60 text-slate-100 focus:border-indigo-500'
                    : 'border-slate-300 bg-slate-50 text-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50"
          >
            <span>Enter Chat Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="relative flex items-center justify-center">
            <div className={`w-full border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}></div>
            <span className={`absolute px-3 text-xs font-medium uppercase ${theme === 'dark' ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>
              or
            </span>
          </div>

          <button
            type="button"
            onClick={handleGuestSignIn}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Instant Guest Sign-In</span>
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Multi-tab real-time session auto-enabled</span>
          </p>
        </form>
      </motion.div>
    </div>
  );
};
