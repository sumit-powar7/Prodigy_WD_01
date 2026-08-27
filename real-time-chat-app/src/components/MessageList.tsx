import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, MessageSquare, Loader2 } from 'lucide-react';
import { Message } from '../types/chat';
import { useChat } from '../context/ChatContext';
import { MessageItem } from './MessageItem';

interface Props {
  messages: Message[];
}

export const MessageList: React.FC<Props> = ({ messages }) => {
  const { typingIndicators, activeRoomId, theme, searchQuery } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeRoomId]);

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(true);
    }
  }, [messages, typingIndicators]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isUp = scrollHeight - scrollTop - clientHeight > 120;
      setShowScrollBottom(isUp);
    }
  };

  // Filter typing indicators for active room
  const currentRoomTyping = typingIndicators.filter((ti) => ti.roomId === activeRoomId);

  // Filter messages if search active
  const filteredMessages = searchQuery.trim()
    ? messages.filter(
        (m) =>
          m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto py-4 space-y-1 custom-scrollbar"
      >
        {filteredMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
              <MessageSquare className="h-8 w-8" />
            </div>
            <h4 className="mt-4 font-bold text-lg text-slate-200">No messages yet</h4>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Be the first to start the conversation in this room!
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => <MessageItem key={msg.id} message={msg} />)
        )}

        {/* Real-Time Active Typing Indicators */}
        {currentRoomTyping.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-indigo-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>
              {currentRoomTyping.map((t) => t.userName).join(', ')} {currentRoomTyping.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Quick Trigger */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-6 flex items-center gap-2 rounded-full bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl hover:bg-indigo-500 transition-transform active:scale-95"
        >
          <ArrowDown className="h-4 w-4" />
          <span>New messages below</span>
        </button>
      )}
    </div>
  );
};
