import React from 'react';
import { FileText, Image as ImageIcon, Music, Code, Download, X, ExternalLink } from 'lucide-react';
import { FileAttachment } from '../types/chat';

interface Props {
  file: FileAttachment;
  onRemove?: () => void;
  onOpenModal?: (file: FileAttachment) => void;
  theme?: 'dark' | 'light';
  isCompact?: boolean;
}

export const FilePreview: React.FC<Props> = ({ file, onRemove, onOpenModal, theme = 'dark', isCompact = false }) => {
  const getIcon = () => {
    switch (file.type) {
      case 'image':
        return <ImageIcon className="h-4 w-4 text-emerald-400" />;
      case 'document':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'audio':
        return <Music className="h-4 w-4 text-purple-400" />;
      case 'code':
        return <Code className="h-4 w-4 text-amber-400" />;
      default:
        return <FileText className="h-4 w-4 text-indigo-400" />;
    }
  };

  if (file.type === 'image' && !isCompact) {
    return (
      <div className="relative group my-1.5 max-w-sm overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
        <img
          src={file.url}
          alt={file.name}
          onClick={() => onOpenModal && onOpenModal(file)}
          className="max-h-60 w-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
          <span className="text-xs font-medium text-white truncate max-w-[200px]">{file.name}</span>
          <div className="flex items-center gap-1.5">
            <a
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-slate-900/80 p-1.5 text-white hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
            {onOpenModal && (
              <button
                onClick={() => onOpenModal(file)}
                className="rounded-lg bg-slate-900/80 p-1.5 text-white hover:bg-slate-800"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1 text-white hover:bg-rose-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative my-1 flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-all ${
        theme === 'dark' ? 'border-slate-800 bg-slate-950/60 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
          {getIcon()}
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-xs font-semibold">{file.name}</p>
          <p className="text-[10px] text-slate-400">{file.size || 'Attachment'}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <a
          href={file.url}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Download attachment"
        >
          <Download className="h-4 w-4" />
        </a>
        {onRemove && (
          <button
            onClick={onRemove}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
