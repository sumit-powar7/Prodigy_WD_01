import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Hash, Lock, Plus, Shield } from 'lucide-react';
import { useChat } from '../context/ChatContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createRoom, theme } = useChat();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom(name.trim(), description.trim(), isPrivate, isPrivate ? password : undefined);
    setName('');
    setDescription('');
    setIsPrivate(false);
    setPassword('');
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-900/50'} backdrop-blur-sm`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${
          theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
        }`}
      >
        <div className={`flex items-center justify-between border-b px-6 py-4 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-500">
              <Hash className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-lg">Create a Channel</h3>
          </div>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400">#</span>
              <input
                type="text"
                required
                placeholder="e.g. project-launch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl border py-2.5 pl-8 pr-4 text-sm font-medium outline-none transition-all ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-950/60 text-slate-100 focus:border-indigo-500'
                    : 'border-slate-300 bg-slate-50 text-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Topic / Description
            </label>
            <input
              type="text"
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-xl border py-2.5 px-4 text-sm font-medium outline-none transition-all ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-950/60 text-slate-100 focus:border-indigo-500'
                  : 'border-slate-300 bg-slate-50 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className={`flex items-center justify-between rounded-xl border p-3.5 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Password Protected Channel</p>
                <p className="text-xs text-slate-400">Require password to join</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {isPrivate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Channel Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Set password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-950/60 text-slate-100 focus:border-indigo-500'
                      : 'border-slate-300 bg-slate-50 text-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Create Channel</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
