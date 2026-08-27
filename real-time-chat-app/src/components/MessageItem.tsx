import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Smile,
  Pin,
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
  Check,
  CheckCheck,
  Copy,
} from 'lucide-react';
import { Message, FileAttachment } from '../types/chat';
import { useChat } from '../context/ChatContext';
import { CodeBlock } from './CodeBlock';
import { FilePreview } from './FilePreview';

interface Props {
  message: Message;
  isFirstInGroup?: boolean;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '🚀', '💡'];

export const MessageItem: React.FC<Props> = ({ message }) => {
  const {
    currentUser,
    theme,
    toggleReaction,
    togglePin,
    deleteMessage,
    editMessage,
    setActiveThreadMessage,
    setRightPanelTab,
    setActiveMediaModal,
  } = useChat();

  const [isHovered, setIsHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const isOwnMessage = currentUser?.id === message.sender.id;

  if (message.isSystem) {
    return (
      <div className="my-3 flex items-center justify-center gap-3 px-4">
        <div className={`h-[1px] flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
          theme === 'dark' ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {message.content}
        </span>
        <div className={`h-[1px] flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim()) {
      editMessage(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  // Helper to parse ```code``` blocks and bold/italics
  const renderMessageContent = (text: string) => {
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1] || 'typescript', content: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return (
      <div className="space-y-1.5 leading-relaxed">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            return <CodeBlock key={idx} code={part.content} language={part.lang} theme={theme} />;
          }

          // Format @mentions, bold **text**, italic *text*
          const formattedText = part.content.split(/(\b@[a-zA-Z0-9_-]+\b)/g).map((token, i) => {
            if (token.startsWith('@')) {
              return (
                <span key={i} className="rounded bg-indigo-500/20 px-1 py-0.5 font-semibold text-indigo-400">
                  {token}
                </span>
              );
            }
            return token;
          });

          return (
            <p key={idx} className="whitespace-pre-wrap break-words text-sm font-normal">
              {formattedText}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowEmojiPicker(false);
      }}
      className={`group relative flex gap-3.5 px-4 py-2 transition-colors ${
        message.isPinned ? (theme === 'dark' ? 'bg-amber-500/5' : 'bg-amber-50/60') : ''
      } ${theme === 'dark' ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50'}`}
    >
      {/* Sender Avatar */}
      <div className="relative shrink-0">
        <img
          src={message.sender.avatar}
          alt={message.sender.name}
          className="h-10 w-10 rounded-full object-cover border border-slate-700/50 shadow-sm"
        />
        {message.sender.status && (
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
              theme === 'dark' ? 'border-slate-950' : 'border-white'
            } ${
              message.sender.status === 'online'
                ? 'bg-emerald-500'
                : message.sender.status === 'away'
                ? 'bg-amber-500'
                : message.sender.status === 'dnd'
                ? 'bg-rose-500'
                : 'bg-slate-400'
            }`}
          ></span>
        )}
      </div>

      {/* Message Content Container */}
      <div className="flex-1 overflow-hidden">
        {/* Header line */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-100">{message.sender.name}</span>
          <span className="text-xs text-slate-400 font-medium">{message.sender.username}</span>
          <span className="text-[11px] text-slate-500">{formattedTime}</span>

          {message.isPinned && (
            <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
              <Pin className="h-2.5 w-2.5" /> Pinned
            </span>
          )}

          {message.isEdited && <span className="text-[10px] italic text-slate-500">(edited)</span>}

          {/* Status Checkmarks */}
          {isOwnMessage && (
            <span className="ml-auto text-slate-400" title={`Status: ${message.status || 'sent'}`}>
              {message.status === 'read' ? (
                <CheckCheck className="h-3.5 w-3.5 text-indigo-400" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <Check className="h-3.5 w-3.5 text-slate-400" />
              )}
            </span>
          )}
        </div>

        {/* Message body / edit input */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="mt-1 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`w-full rounded-xl border p-2.5 text-sm font-medium outline-none ${
                theme === 'dark' ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-800'
              }`}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-0.5 text-slate-200">{renderMessageContent(message.content)}</div>
        )}

        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((file: FileAttachment) => (
              <FilePreview
                key={file.id}
                file={file}
                onOpenModal={(f) => setActiveMediaModal(f)}
                theme={theme}
              />
            ))}
          </div>
        )}

        {/* Reactions row */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {message.reactions.map((r) => {
              const hasReacted = currentUser && r.users.includes(currentUser.id);
              return (
                <button
                  key={r.emoji}
                  onClick={() => toggleReaction(message.id, r.emoji)}
                  className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-semibold transition-all ${
                    hasReacted
                      ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300'
                      : theme === 'dark'
                      ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={`${r.users.length} reaction(s)`}
                >
                  <span>{r.emoji}</span>
                  <span>{r.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Thread Replies Button */}
        {((message.threadCount && message.threadCount > 0) || message.threadReplies?.length) && (
          <button
            onClick={() => {
              setActiveThreadMessage(message);
              setRightPanelTab('thread');
            }}
            className="mt-2 flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>
              {message.threadCount || message.threadReplies?.length} {message.threadCount === 1 ? 'reply' : 'replies'}
            </span>
          </button>
        )}
      </div>

      {/* Hover Action Toolbar */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute -top-3 right-4 z-10 flex items-center gap-1 rounded-xl border p-1 shadow-lg backdrop-blur-md ${
            theme === 'dark' ? 'border-slate-800 bg-slate-900/90 text-slate-300' : 'border-slate-200 bg-white/95 text-slate-700'
          }`}
        >
          {/* Quick Reaction Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="rounded-lg p-1.5 hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors"
              title="Add reaction"
            >
              <Smile className="h-4 w-4" />
            </button>

            {showEmojiPicker && (
              <div className="absolute right-0 top-8 z-20 flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      toggleReaction(message.id, emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="rounded-lg p-1 hover:bg-slate-800 text-lg transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setActiveThreadMessage(message);
              setRightPanelTab('thread');
            }}
            className="rounded-lg p-1.5 hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors"
            title="Reply in thread"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          <button
            onClick={() => togglePin(message.id)}
            className={`rounded-lg p-1.5 transition-colors ${
              message.isPinned ? 'text-amber-400 bg-amber-500/20' : 'hover:bg-amber-500/20 hover:text-amber-400'
            }`}
            title={message.isPinned ? 'Unpin message' : 'Pin message'}
          >
            <Pin className="h-4 w-4" />
          </button>

          <button
            onClick={handleCopyText}
            className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-white transition-colors"
            title="Copy text"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          {isOwnMessage && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg p-1.5 hover:bg-blue-600/20 hover:text-blue-400 transition-colors"
                title="Edit message"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteMessage(message.id)}
                className="rounded-lg p-1.5 hover:bg-rose-600/20 hover:text-rose-400 transition-colors"
                title="Delete message"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};
