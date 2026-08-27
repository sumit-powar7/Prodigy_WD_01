import React, { useState, useRef } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Code,
  Image as ImageIcon,
  FileText,
  Bold,
  Italic,
  X,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { FileAttachment } from '../types/chat';

const EMOJI_LIST = ['👍', '❤️', '😂', '🔥', '🎉', '🚀', '💡', '💯', '✨', '🙌', '😍', '👏', '🤝', '⚡', '🤖', '☕'];

export const MessageInput: React.FC = () => {
  const { sendMessage, startTyping, stopTyping, theme } = useChat();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    startTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;
    sendMessage(content, attachments.length > 0 ? attachments : undefined);
    setContent('');
    setAttachments([]);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    stopTyping();
  };

  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const attachSampleImage = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    ];
    const url = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    const newAttach: FileAttachment = {
      id: 'att_' + Date.now(),
      name: `preview_screenshot_${Math.floor(Math.random() * 100)}.png`,
      url,
      type: 'image',
      size: '1.2 MB',
    };
    setAttachments((prev) => [...prev, newAttach]);
    setShowAttachMenu(false);
  };

  const attachSampleDoc = () => {
    const newAttach: FileAttachment = {
      id: 'att_' + Date.now(),
      name: 'System_Architecture_Doc.pdf',
      url: '#',
      type: 'document',
      size: '3.4 MB',
    };
    setAttachments((prev) => [...prev, newAttach]);
    setShowAttachMenu(false);
  };

  const attachCodeSnippet = () => {
    const snippet = "```typescript\n// Real-time broadcast helper\nexport function syncState(payload: any) {\n  wsService.broadcast('SYNC_EVENT', userId, payload);\n}\n```";
    setContent((prev) => (prev ? prev + '\n' + snippet : snippet));
    setShowAttachMenu(false);
  };

  const applyFormat = (prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;
    setContent(content.substring(0, start) + replacement + content.substring(end));
  };

  return (
    <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
      {/* Attachments Preview Chips */}
      {attachments.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                theme === 'dark' ? 'border-slate-800 bg-slate-950 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-800'
              }`}
            >
              <span className="truncate max-w-[150px]">{att.name}</span>
              <button
                onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                className="text-slate-400 hover:text-rose-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Bar */}
      <div className={`relative flex flex-col rounded-2xl border transition-all ${
        theme === 'dark' ? 'border-slate-800 bg-slate-950/80 focus-within:border-indigo-500' : 'border-slate-300 bg-slate-50 focus-within:border-indigo-500'
      }`}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message... (Enter to send, Shift + Enter for new line)"
          rows={2}
          className="w-full resize-none border-none bg-transparent p-3.5 text-sm font-medium outline-none placeholder:text-slate-500"
        />

        {/* Toolbar Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/40 px-3 py-2">
          <div className="flex items-center gap-1">
            {/* Attachments Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu((prev) => !prev)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Attach file or media"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {showAttachMenu && (
                <div className="absolute left-0 bottom-10 z-20 w-48 rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-2xl space-y-1">
                  <button
                    onClick={attachSampleImage}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    <ImageIcon className="h-4 w-4 text-emerald-400" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    onClick={attachSampleDoc}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span>Attach Document</span>
                  </button>
                  <button
                    onClick={attachCodeSnippet}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    <Code className="h-4 w-4 text-amber-400" />
                    <span>Insert Code Snippet</span>
                  </button>
                </div>
              )}
            </div>

            {/* Emoji Picker Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </button>

              {showEmojiPicker && (
                <div className="absolute left-0 bottom-10 z-20 grid grid-cols-4 gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl w-48">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="rounded-lg p-1.5 text-center text-lg hover:bg-slate-800 hover:scale-110 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-slate-800 my-auto mx-1"></div>

            {/* Quick Formatting */}
            <button
              type="button"
              onClick={() => applyFormat('**', '**')}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*')}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('```typescript\n', '\n```')}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Code block"
            >
              <Code className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() && attachments.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:shadow-none"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
