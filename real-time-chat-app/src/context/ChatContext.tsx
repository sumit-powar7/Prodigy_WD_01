import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Room, Message, TypingIndicator, UserStatus, ToastNotification, FileAttachment } from '../types/chat';
import {
  getStoredUser,
  setStoredUser,
  getStoredRooms,
  setStoredRooms,
  getStoredMessages,
  setStoredMessages,
  DEFAULT_BOT_USERS,
} from '../utils/storage';
import { wsService, WSEvent } from '../services/websocket';
import { sounds } from '../utils/audio';

interface ChatContextType {
  currentUser: User | null;
  users: User[];
  rooms: Room[];
  activeRoomId: string;
  messages: Record<string, Message[]>;
  typingIndicators: TypingIndicator[];
  activeThreadMessage: Message | null;
  rightPanelTab: 'members' | 'media' | 'pinned' | 'thread' | null;
  searchQuery: string;
  theme: 'dark' | 'light';
  isMuted: boolean;
  toasts: ToastNotification[];
  activeMediaModal: FileAttachment | null;
  
  // Actions
  login: (name: string, username: string, avatar: string) => void;
  logout: () => void;
  updateStatus: (status: UserStatus, statusText?: string) => void;
  setActiveRoomId: (roomId: string) => void;
  sendMessage: (content: string, attachments?: FileAttachment[]) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  togglePin: (messageId: string) => void;
  addThreadReply: (messageId: string, content: string, attachments?: FileAttachment[]) => void;
  setActiveThreadMessage: (msg: Message | null) => void;
  setRightPanelTab: (tab: 'members' | 'media' | 'pinned' | 'thread' | null) => void;
  createRoom: (name: string, description: string, isPrivate: boolean, password?: string) => void;
  openDirectMessage: (targetUser: User) => void;
  startTyping: () => void;
  stopTyping: () => void;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  toggleMute: () => void;
  removeToast: (id: string) => void;
  setActiveMediaModal: (media: FileAttachment | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [users, setUsers] = useState<User[]>(DEFAULT_BOT_USERS);
  const [rooms, setRooms] = useState<Room[]>(getStoredRooms());
  const [activeRoomId, setActiveRoomId] = useState<string>('room_general');
  const [messages, setMessages] = useState<Record<string, Message[]>>(getStoredMessages());
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [activeThreadMessage, setActiveThreadMessage] = useState<Message | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'members' | 'media' | 'pinned' | 'thread' | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [activeMediaModal, setActiveMediaModal] = useState<FileAttachment | null>(null);

  // Sync users list with current user if logged in
  useEffect(() => {
    if (currentUser) {
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === currentUser.id);
        if (exists) {
          return prev.map((u) => (u.id === currentUser.id ? currentUser : u));
        }
        return [currentUser, ...prev];
      });
    }
  }, [currentUser]);

  // Save changes to localStorage
  useEffect(() => {
    setStoredRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    setStoredMessages(messages);
  }, [messages]);

  // Clear unread badge for active room
  useEffect(() => {
    setRooms((prev) =>
      prev.map((r) => (r.id === activeRoomId ? { ...r, unreadCount: 0 } : r))
    );
  }, [activeRoomId]);

  // Remove stale typing indicators (>4 seconds old)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingIndicators((prev) => prev.filter((ti) => now - ti.timestamp < 4000));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket Event Handling Subscriptions
  useEffect(() => {
    const unsubscribe = wsService.subscribe('*', (event: WSEvent) => {
      switch (event.type) {
        case 'MESSAGE_SEND': {
          const newMsg = event.payload as Message;
          setMessages((prev) => {
            const roomMsgs = prev[newMsg.roomId] || [];
            // Prevent duplicates
            if (roomMsgs.some((m) => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              [newMsg.roomId]: [...roomMsgs, newMsg],
            };
          });

          // Unread badge & Toast notification if not in active room
          if (newMsg.roomId !== activeRoomId) {
            setRooms((prev) =>
              prev.map((r) => (r.id === newMsg.roomId ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r))
            );

            sounds.playMessageSound(isMuted);

            // Add Toast
            const toast: ToastNotification = {
              id: 'toast_' + Date.now(),
              title: newMsg.sender.name,
              description: newMsg.content.substring(0, 60) + (newMsg.content.length > 60 ? '...' : ''),
              senderName: newMsg.sender.name,
              senderAvatar: newMsg.sender.avatar,
              roomId: newMsg.roomId,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setToasts((prev) => [toast, ...prev.slice(0, 4)]);
          } else if (newMsg.sender.id !== currentUser?.id) {
            sounds.playMessageSound(isMuted);
          }
          break;
        }

        case 'MESSAGE_UPDATE': {
          const updatedMsg = event.payload as Message;
          setMessages((prev) => {
            const roomMsgs = prev[updatedMsg.roomId] || [];
            return {
              ...prev,
              [updatedMsg.roomId]: roomMsgs.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)),
            };
          });
          break;
        }

        case 'MESSAGE_DELETE': {
          const { messageId, roomId } = event.payload as { messageId: string; roomId: string };
          setMessages((prev) => {
            const roomMsgs = prev[roomId] || [];
            return {
              ...prev,
              [roomId]: roomMsgs.filter((m) => m.id !== messageId),
            };
          });
          break;
        }

        case 'TYPING_START': {
          const ti = event.payload as TypingIndicator;
          if (ti.userId !== currentUser?.id) {
            setTypingIndicators((prev) => {
              const filtered = prev.filter((item) => !(item.userId === ti.userId && item.roomId === ti.roomId));
              return [...filtered, ti];
            });
          }
          break;
        }

        case 'TYPING_STOP': {
          const ti = event.payload as TypingIndicator;
          setTypingIndicators((prev) =>
            prev.filter((item) => !(item.userId === ti.userId && item.roomId === ti.roomId))
          );
          break;
        }

        case 'STATUS_CHANGE': {
          const { userId, status, statusText } = event.payload as { userId: string; status: UserStatus; statusText?: string };
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, status, statusText: statusText ?? u.statusText } : u))
          );
          break;
        }

        case 'ROOM_CREATE': {
          const newRoom = event.payload as Room;
          setRooms((prev) => {
            if (prev.some((r) => r.id === newRoom.id)) return prev;
            return [...prev, newRoom];
          });
          break;
        }

        case 'REACTION_TOGGLE': {
          const { messageId, roomId, emoji, userId } = event.payload as { messageId: string; roomId: string; emoji: string; userId: string };
          setMessages((prev) => {
            const roomMsgs = prev[roomId] || [];
            return {
              ...prev,
              [roomId]: roomMsgs.map((msg) => {
                if (msg.id !== messageId) return msg;
                const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
                let updatedReactions = [...msg.reactions];

                if (existingReaction) {
                  if (existingReaction.users.includes(userId)) {
                    // Remove reaction
                    const newUsers = existingReaction.users.filter((u) => u !== userId);
                    if (newUsers.length === 0) {
                      updatedReactions = updatedReactions.filter((r) => r.emoji !== emoji);
                    } else {
                      updatedReactions = updatedReactions.map((r) =>
                        r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r
                      );
                    }
                  } else {
                    // Add user to reaction
                    const newUsers = [...existingReaction.users, userId];
                    updatedReactions = updatedReactions.map((r) =>
                      r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r
                    );
                  }
                } else {
                  // New emoji reaction
                  updatedReactions.push({
                    emoji,
                    count: 1,
                    users: [userId],
                  });
                }

                return { ...msg, reactions: updatedReactions };
              }),
            };
          });
          break;
        }

        case 'PIN_TOGGLE': {
          const { messageId, roomId } = event.payload as { messageId: string; roomId: string };
          setMessages((prev) => {
            const roomMsgs = prev[roomId] || [];
            return {
              ...prev,
              [roomId]: roomMsgs.map((m) => (m.id === messageId ? { ...m, isPinned: !m.isPinned } : m)),
            };
          });
          break;
        }

        case 'THREAD_REPLY': {
          const { messageId, roomId, reply } = event.payload as { messageId: string; roomId: string; reply: unknown };
          setMessages((prev) => {
            const roomMsgs = prev[roomId] || [];
            return {
              ...prev,
              [roomId]: roomMsgs.map((m) => {
                if (m.id !== messageId) return m;
                const replies = m.threadReplies || [];
                return {
                  ...m,
                  threadCount: (m.threadCount || 0) + 1,
                  lastThreadTimestamp: new Date().toISOString(),
                  threadReplies: [...replies, reply as never],
                };
              }),
            };
          });

          // If active thread open, update active thread message
          setActiveThreadMessage((prev) => {
            if (prev && prev.id === messageId) {
              const replies = prev.threadReplies || [];
              return {
                ...prev,
                threadCount: (prev.threadCount || 0) + 1,
                lastThreadTimestamp: new Date().toISOString(),
                threadReplies: [...replies, reply as never],
              };
            }
            return prev;
          });
          break;
        }
      }
    });

    return () => unsubscribe();
  }, [activeRoomId, currentUser, isMuted]);

  const login = (name: string, username: string, avatar: string) => {
    const newUser: User = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      name,
      username: username.startsWith('@') ? username : `@${username}`,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'online',
      statusText: '💬 Ready to chat',
    };
    setCurrentUser(newUser);
    setStoredUser(newUser);

    // Broadcast user connect system message
    const joinMsg: Message = {
      id: 'sys_' + Date.now(),
      roomId: 'room_general',
      sender: newUser,
      content: `${newUser.name} joined the workspace. Say hi! 👋`,
      timestamp: new Date().toISOString(),
      isSystem: true,
      reactions: [],
    };
    wsService.broadcast('MESSAGE_SEND', newUser.id, joinMsg);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nexus_chat_current_user');
  };

  const updateStatus = (status: UserStatus, statusText?: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, status, statusText: statusText ?? currentUser.statusText };
    setCurrentUser(updated);
    setStoredUser(updated);

    wsService.broadcast('STATUS_CHANGE', currentUser.id, {
      userId: currentUser.id,
      status,
      statusText: statusText ?? currentUser.statusText,
    });
  };

  const sendMessage = (content: string, attachments?: FileAttachment[]) => {
    if (!currentUser || (!content.trim() && (!attachments || attachments.length === 0))) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      roomId: activeRoomId,
      sender: currentUser,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      reactions: [],
      attachments: attachments || [],
      status: 'sent',
    };

    sounds.playSendSound(isMuted);
    wsService.broadcast('MESSAGE_SEND', currentUser.id, newMsg);
    stopTyping();
  };

  const editMessage = (messageId: string, newContent: string) => {
    if (!currentUser) return;
    const roomMsgs = messages[activeRoomId] || [];
    const target = roomMsgs.find((m) => m.id === messageId);
    if (target) {
      const updated: Message = {
        ...target,
        content: newContent,
        isEdited: true,
      };
      wsService.broadcast('MESSAGE_UPDATE', currentUser.id, updated);
    }
  };

  const deleteMessage = (messageId: string) => {
    if (!currentUser) return;
    wsService.broadcast('MESSAGE_DELETE', currentUser.id, { messageId, roomId: activeRoomId });
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    sounds.playReactionSound(isMuted);
    wsService.broadcast('REACTION_TOGGLE', currentUser.id, {
      messageId,
      roomId: activeRoomId,
      emoji,
      userId: currentUser.id,
    });
  };

  const togglePin = (messageId: string) => {
    if (!currentUser) return;
    wsService.broadcast('PIN_TOGGLE', currentUser.id, {
      messageId,
      roomId: activeRoomId,
    });
  };

  const addThreadReply = (messageId: string, content: string, attachments?: FileAttachment[]) => {
    if (!currentUser || !content.trim()) return;

    const reply = {
      id: 'reply_' + Date.now(),
      messageId,
      sender: currentUser,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      attachments,
    };

    sounds.playSendSound(isMuted);
    wsService.broadcast('THREAD_REPLY', currentUser.id, {
      messageId,
      roomId: activeRoomId,
      reply,
    });
  };

  const createRoom = (name: string, description: string, isPrivate: boolean, password?: string) => {
    if (!currentUser) return;
    const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newRoom: Room = {
      id: 'room_' + Date.now(),
      name: cleanName,
      description,
      isPrivate,
      password,
      membersCount: 1,
      createdBy: currentUser.id,
      category: 'channels',
    };

    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(newRoom.id);
    wsService.broadcast('ROOM_CREATE', currentUser.id, newRoom);

    // Post creation system message
    const sysMsg: Message = {
      id: 'sys_' + Date.now(),
      roomId: newRoom.id,
      sender: currentUser,
      content: `#${cleanName} channel was created by ${currentUser.name}. Topic: ${description}`,
      timestamp: new Date().toISOString(),
      isSystem: true,
      reactions: [],
    };
    wsService.broadcast('MESSAGE_SEND', currentUser.id, sysMsg);
  };

  const openDirectMessage = (targetUser: User) => {
    if (!currentUser) return;
    const dmRoomId = `dm_${[currentUser.id, targetUser.id].sort().join('_')}`;
    const existing = rooms.find((r) => r.id === dmRoomId);

    if (!existing) {
      const dmRoom: Room = {
        id: dmRoomId,
        name: targetUser.name,
        description: `Direct message conversation with ${targetUser.name}`,
        isDirectMessage: true,
        dmUserId: targetUser.id,
        category: 'direct_messages',
      };

      setRooms((prev) => [...prev, dmRoom]);
      wsService.broadcast('ROOM_CREATE', currentUser.id, dmRoom);
    }

    setActiveRoomId(dmRoomId);
  };

  const startTyping = () => {
    if (!currentUser) return;
    wsService.broadcast<TypingIndicator>('TYPING_START', currentUser.id, {
      userId: currentUser.id,
      userName: currentUser.name,
      roomId: activeRoomId,
      timestamp: Date.now(),
    });
  };

  const stopTyping = () => {
    if (!currentUser) return;
    wsService.broadcast<TypingIndicator>('TYPING_STOP', currentUser.id, {
      userId: currentUser.id,
      userName: currentUser.name,
      roomId: activeRoomId,
      timestamp: Date.now(),
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        users,
        rooms,
        activeRoomId,
        messages,
        typingIndicators,
        activeThreadMessage,
        rightPanelTab,
        searchQuery,
        theme,
        isMuted,
        toasts,
        activeMediaModal,
        login,
        logout,
        updateStatus,
        setActiveRoomId,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        togglePin,
        addThreadReply,
        setActiveThreadMessage,
        setRightPanelTab,
        createRoom,
        openDirectMessage,
        startTyping,
        stopTyping,
        setSearchQuery,
        toggleTheme,
        toggleMute,
        removeToast,
        setActiveMediaModal,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
