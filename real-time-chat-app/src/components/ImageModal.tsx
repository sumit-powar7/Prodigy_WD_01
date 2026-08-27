import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ExternalLink } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export const ImageModal: React.FC = () => {
  const { activeMediaModal, setActiveMediaModal } = useChat();

  if (!activeMediaModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900">
            <span className="font-semibold text-sm text-slate-200 truncate max-w-md">
              {activeMediaModal.name}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={activeMediaModal.url}
                download={activeMediaModal.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Media Body */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60">
            {activeMediaModal.type === 'image' ? (
              <img
                src={activeMediaModal.url}
                alt={activeMediaModal.name}
                className="max-h-[75vh] w-auto rounded-xl object-contain shadow-2xl"
              />
            ) : (
              <div className="p-8 text-center space-y-4">
                <p className="text-sm font-semibold text-slate-300">File Preview ({activeMediaModal.name})</p>
                <a
                  href={activeMediaModal.url}
                  download={activeMediaModal.name}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open File</span>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
