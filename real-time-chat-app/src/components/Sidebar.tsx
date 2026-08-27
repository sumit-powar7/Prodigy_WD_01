import React, { useState } from 'react';
import {
  Hash,
  Plus,
  Search,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  MessageSquare,
  Lock,
  Radio,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { UserStatus, Room } from '../types/chat';

interface Props {
  onOpenCreateRoom: () => void;
}

export const Sidebar: React.FC<Props> = ({ onOpenCreateRoom }) => {
  const {
    currentUser,
    updateStatus,
    logout,
    rooms,
    activeRoomId,
    setActiveRoomId,
    users,
    openDirectMessage,
    theme,
    toggleTheme,
    isMuted,
    toggleMute,
    searchQuery,
    setSearchQuery,
  } = useChat();

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions: { label: string; value: UserStatus; color: string }[] = [
    { label: 'Online', value: 'online', color: 'bg-emerald-500' },
    { label: 'Away', value: 'away', color: 'bg-amber-500' },
    { label: 'Do Not Disturb', value: 'dnd', color: 'bg-rose-500' },
    { label: 'Offline', value: 'offline', color: 'bg-slate-400' },
  ];

  const publicChannels = rooms.filter((r) => r.category === 'channels' || (!r.isDirectMessage && !r.category));
  const dmRooms = rooms.filter((r) => r.isDirectMessage || r.category === 'direct_messages');

  // Filter channels/users based on search
  const filteredChannels = searchQuery.trim()
    ? publicChannels.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : publicChannels;

  const filteredUsers = searchQuery.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== currentUser?.id)
    : users.filter((u) => u.id !== currentUser?.id);

  return (
    <div
      className={`w-72 shrink-0 border-r flex flex-col h-full select-none ${
        theme === 'dark' ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-900 text-white'
      }`}
    >
      {/* User Profile Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-800/80 transition-colors text-left"
            >
              <div className="relative shrink-0">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-700"
                />
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 ${
                    currentUser?.status === 'online'
                      ? 'bg-emerald-500'
                      : currentUser?.status === 'away'
                      ? 'bg-amber-500'
                      : currentUser?.status === 'dnd'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                ></span>
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm truncate text-slate-100">{currentUser?.name || 'Guest User'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.statusText || currentUser?.username}</p>
              </div>
            </button>

            {/* Status Dropdown */}
            {showStatusDropdown && (
              <div className="absolute left-0 top-14 z-30 w-48 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl space-y-1">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Set Presence</p>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      updateStatus(opt.value);
                      setShowStatusDropdown(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`}></span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header Utilities */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMute}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            </button>

            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
            </button>

            <button
              onClick={logout}
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search channels or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs font-medium text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
        {/* Public Channels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Channels</span>
            <button
              onClick={onOpenCreateRoom}
              className="rounded-lg p-1 text-slate-400 hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors"
              title="Create channel"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            {filteredChannels.map((room: Room) => {
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {room.isPrivate ? <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" /> : <Hash className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    <span className="truncate">{room.name}</span>
                  </div>

                  {room.unreadCount && room.unreadCount > 0 ? (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-md">
                      {room.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Messages List */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Direct Messages</span>
          </div>

          <div className="space-y-1">
            {filteredUsers.map((u) => {
              const dmRoomId = `dm_${[currentUser?.id, u.id].sort().join('_')}`;
              const isActive = activeRoomId === dmRoomId;
              const dmRoom = dmRooms.find((r) => r.id === dmRoomId);

              return (
                <button
                  key={u.id}
                  onClick={() => openDirectMessage(u)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="relative shrink-0">
                      <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-full object-cover border border-slate-700" />
                      <span
                        className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-slate-950 ${
                          u.status === 'online'
                            ? 'bg-emerald-500'
                            : u.status === 'away'
                            ? 'bg-amber-500'
                            : u.status === 'dnd'
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                    </div>
                    <span className="truncate">{u.name}</span>
                    {u.isBot && <span className="rounded bg-indigo-500/20 px-1 text-[9px] text-indigo-400 font-semibold">BOT</span>}
                  </div>

                  {dmRoom?.unreadCount && dmRoom.unreadCount > 0 ? (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                      {dmRoom.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-slate-400 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 font-medium">
          <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>WebSocket Real-Time Sync</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">v2.4.0</span>
      </div>
    </div>
  );
};
