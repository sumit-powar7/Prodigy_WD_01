import React, { useState } from 'react';
import { X, Users, Image as ImageIcon, Pin, Send, MessageSquare } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { FilePreview } from './FilePreview';

export const RightPanel: React.FC = () => {
  const {
    rightPanelTab,
    setRightPanelTab,
    activeThreadMessage,
    setActiveThreadMessage,
    addThreadReply,
    users,
    messages,
    activeRoomId,
    openDirectMessage,
    togglePin,
    theme,
  } = useChat();

  const [replyText, setReplyText] = useState('');

  if (!rightPanelTab) return null;

  const handleSendThreadReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeThreadMessage && replyText.trim()) {
      addThreadReply(activeThreadMessage.id, replyText.trim());
      setReplyText('');
    }
  };

  const roomMessages = messages[activeRoomId] || [];
  const pinnedMessages = roomMessages.filter((m) => m.isPinned);
  const mediaAttachments = roomMessages.flatMap((m) => m.attachments || []);

  return (
    <div
      className={`w-80 shrink-0 border-l flex flex-col h-full shadow-2xl z-20 ${
        theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b px-4 py-3.5 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2 font-semibold text-sm">
          {rightPanelTab === 'thread' && (
            <>
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <span>Thread Conversation</span>
            </>
          )}
          {rightPanelTab === 'members' && (
            <>
              <Users className="h-4 w-4 text-indigo-400" />
              <span>Channel Members ({users.length})</span>
            </>
          )}
          {rightPanelTab === 'media' && (
            <>
              <ImageIcon className="h-4 w-4 text-emerald-400" />
              <span>Shared Media ({mediaAttachments.length})</span>
            </>
          )}
          {rightPanelTab === 'pinned' && (
            <>
              <Pin className="h-4 w-4 text-amber-400" />
              <span>Pinned Messages ({pinnedMessages.length})</span>
            </>
          )}
        </div>

        <button
          onClick={() => {
            setRightPanelTab(null);
            setActiveThreadMessage(null);
          }}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Thread Tab */}
        {rightPanelTab === 'thread' && activeThreadMessage && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-4">
              {/* Original Parent Message */}
              <div className={`rounded-xl border p-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <img src={activeThreadMessage.sender.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                  <span className="font-bold text-xs">{activeThreadMessage.sender.name}</span>
                </div>
                <p className="text-xs text-slate-200">{activeThreadMessage.content}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="h-[1px] flex-1 bg-slate-800"></div>
                <span>Replies</span>
                <div className="h-[1px] flex-1 bg-slate-800"></div>
              </div>

              {/* Reply list */}
              <div className="space-y-3">
                {activeThreadMessage.threadReplies && activeThreadMessage.threadReplies.length > 0 ? (
                  activeThreadMessage.threadReplies.map((reply) => (
                    <div key={reply.id} className="flex gap-2.5">
                      <img src={reply.sender.avatar} alt="" className="h-7 w-7 rounded-full object-cover mt-0.5" />
                      <div className={`flex-1 rounded-xl border p-2.5 text-xs ${theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{reply.sender.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-200">{reply.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center text-slate-500 py-4">No replies yet. Start the thread!</p>
                )}
              </div>
            </div>

            {/* Thread Reply Input */}
            <form onSubmit={handleSendThreadReply} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Reply in thread..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium outline-none ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-950 text-white focus:border-indigo-500' : 'border-slate-300 bg-slate-50 text-slate-800 focus:border-indigo-500'
                }`}
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Members Tab */}
        {rightPanelTab === 'members' && (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => openDirectMessage(u)}
                className={`flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-colors ${
                  theme === 'dark' ? 'border-slate-800/60 bg-slate-950/40 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative shrink-0">
                    <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 ${
                        theme === 'dark' ? 'border-slate-950' : 'border-white'
                      } ${
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
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-bold text-slate-200">{u.name}</p>
                      {u.isBot && <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-semibold text-indigo-400">BOT</span>}
                    </div>
                    <p className="truncate text-[11px] text-slate-400">{u.statusText || u.username}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDirectMessage(u);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors"
                  title="Direct Message"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Media Tab */}
        {rightPanelTab === 'media' && (
          <div className="space-y-3">
            {mediaAttachments.length === 0 ? (
              <p className="text-xs text-center text-slate-500 py-8">No shared media in this room yet.</p>
            ) : (
              mediaAttachments.map((f) => <FilePreview key={f.id} file={f} theme={theme} />)
            )}
          </div>
        )}

        {/* Pinned Tab */}
        {rightPanelTab === 'pinned' && (
          <div className="space-y-3">
            {pinnedMessages.length === 0 ? (
              <p className="text-xs text-center text-slate-500 py-8">No pinned messages in this room yet.</p>
            ) : (
              pinnedMessages.map((msg) => (
                <div key={msg.id} className={`rounded-xl border p-3 text-xs relative ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{msg.sender.name}</span>
                    <button onClick={() => togglePin(msg.id)} className="text-slate-400 hover:text-rose-400" title="Unpin">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-300">{msg.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
