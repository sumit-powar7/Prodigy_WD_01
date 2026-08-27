import React from 'react';
import {
  Hash,
  Lock,
  Users,
  Image as ImageIcon,
  Pin,
  Menu,
  ShieldAlert,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface Props {
  onToggleMobileSidebar: () => void;
}

export const ChatRoom: React.FC<Props> = ({ onToggleMobileSidebar }) => {
  const {
    rooms,
    activeRoomId,
    messages,
    users,
    setRightPanelTab,
    rightPanelTab,
    theme,
  } = useChat();

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const roomMessages = messages[activeRoom.id] || [];

  // If DM room, get recipient user
  const recipient = activeRoom.isDirectMessage
    ? users.find((u) => u.id === activeRoom.dmUserId) || {
        name: activeRoom.name,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'online',
        statusText: 'Active in chat',
      }
    : null;

  return (
    <div className={`flex flex-1 flex-col h-full overflow-hidden ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header Bar */}
      <div className={`flex h-16 items-center justify-between border-b px-4 shrink-0 shadow-sm ${
        theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>

          {activeRoom.isDirectMessage && recipient ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative shrink-0">
                <img src={recipient.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 ${
                    theme === 'dark' ? 'border-slate-900' : 'border-white'
                  } ${
                    recipient.status === 'online'
                      ? 'bg-emerald-500'
                      : recipient.status === 'away'
                      ? 'bg-amber-500'
                      : recipient.status === 'dnd'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                ></span>
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm truncate">{recipient.name}</h3>
                <p className="text-xs text-slate-400 truncate">{recipient.statusText || 'Direct Message'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
                {activeRoom.isPrivate ? <Lock className="h-5 w-5 text-amber-400" /> : <Hash className="h-5 w-5" />}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight truncate">#{activeRoom.name}</h3>
                  {activeRoom.isPrivate && (
                    <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                      <ShieldAlert className="h-3 w-3" /> Protected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{activeRoom.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRightPanelTab(rightPanelTab === 'pinned' ? null : 'pinned')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              rightPanelTab === 'pinned'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Pinned messages"
          >
            <Pin className="h-4 w-4" />
            <span className="hidden sm:inline">Pinned</span>
          </button>

          <button
            onClick={() => setRightPanelTab(rightPanelTab === 'media' ? null : 'media')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              rightPanelTab === 'media'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Shared Media"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Media</span>
          </button>

          <button
            onClick={() => setRightPanelTab(rightPanelTab === 'members' ? null : 'members')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              rightPanelTab === 'members'
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Members list"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{users.length} Members</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <MessageList messages={roomMessages} />

      {/* Input Toolbar */}
      <MessageInput />
    </div>
  );
};
