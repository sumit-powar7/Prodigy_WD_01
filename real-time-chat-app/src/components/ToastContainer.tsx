import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, setActiveRoomId, theme } = useChat();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={() => {
              if (toast.roomId) setActiveRoomId(toast.roomId);
              removeToast(toast.id);
            }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-2xl cursor-pointer backdrop-blur-md transition-transform hover:scale-[1.02] ${
              theme === 'dark'
                ? 'border-indigo-500/30 bg-slate-900/95 text-slate-100 shadow-indigo-500/10'
                : 'border-indigo-200 bg-white/95 text-slate-800 shadow-indigo-200/50'
            }`}
          >
            <div className="relative shrink-0 mt-0.5">
              <img
                src={toast.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt=""
                className="h-9 w-9 rounded-full object-cover border border-indigo-500/40"
              />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-indigo-600 p-0.5 text-white">
                <MessageSquare className="h-2.5 w-2.5" />
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="font-bold text-xs truncate text-indigo-400">{toast.title}</p>
                <span className="text-[10px] text-slate-500">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{toast.description}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
