import { User, Room, Message } from '../types/chat';

const STORAGE_KEYS = {
  CURRENT_USER: 'nexus_chat_current_user',
  ROOMS: 'nexus_chat_rooms',
  MESSAGES: 'nexus_chat_messages',
  THEME: 'nexus_chat_theme',
  MUTED: 'nexus_chat_muted',
};

export const DEFAULT_BOT_USERS: User[] = [
  {
    id: 'bot_nexus_ai',
    name: 'Nexus AI Bot',
    username: 'nexus_ai',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    statusText: '🤖 Ask me anything with @Nexus AI',
    isBot: true,
  },
  {
    id: 'user_alex_m',
    name: 'Alex Morgan',
    username: 'alex_m',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    statusText: '🚀 Building real-time apps',
    isBot: false,
  },
  {
    id: 'user_sarah_k',
    name: 'Sarah Chen',
    username: 'sarah_c',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'away',
    statusText: '☕ Grabbed a coffee',
    isBot: false,
  },
  {
    id: 'user_marcus_v',
    name: 'Marcus Vance',
    username: 'marcus_v',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'dnd',
    statusText: '🎧 Deep focus mode',
    isBot: false,
  },
  {
    id: 'user_aria_t',
    name: 'Aria Taylor',
    username: 'aria_t',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    statusText: '🎨 Designing interface components',
    isBot: false,
  },
];

export const DEFAULT_ROOMS: Room[] = [
  {
    id: 'room_general',
    name: 'general',
    description: 'General community chatter, greetings, and high-fives.',
    isPrivate: false,
    membersCount: 128,
    category: 'channels',
  },
  {
    id: 'room_announcements',
    name: 'announcements',
    description: 'Official workspace updates, release notes, and news.',
    isPrivate: false,
    membersCount: 250,
    category: 'channels',
  },
  {
    id: 'room_tech_talk',
    name: 'tech-talk',
    description: 'WebSockets, React 19, state management, performance & architecture.',
    isPrivate: false,
    membersCount: 94,
    category: 'channels',
  },
  {
    id: 'room_random',
    name: 'random',
    description: 'Memes, music recommendations, hobbies, and random fun.',
    isPrivate: false,
    membersCount: 110,
    category: 'channels',
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  room_general: [
    {
      id: 'msg_welcome_1',
      roomId: 'room_general',
      sender: DEFAULT_BOT_USERS[0],
      content: '👋 **Welcome to Nexus Chat!** Real-time messaging, multi-tab sync, code syntax formatting, media previews, and interactive direct messages are active.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      isPinned: true,
      reactions: [
        { emoji: '👋', count: 5, users: ['user_alex_m', 'user_sarah_k'] },
        { emoji: '🔥', count: 8, users: ['user_marcus_v', 'user_aria_t'] },
      ],
      status: 'read',
    },
    {
      id: 'msg_welcome_2',
      roomId: 'room_general',
      sender: DEFAULT_BOT_USERS[1], // Alex
      content: 'Hey everyone! Testing the multi-tab synchronization layer. Open another tab or window to see real-time state broadcast in action! 🚀',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      reactions: [
        { emoji: '❤️', count: 3, users: ['user_sarah_k'] },
      ],
      status: 'read',
    },
    {
      id: 'msg_welcome_3',
      roomId: 'room_general',
      sender: DEFAULT_BOT_USERS[2], // Sarah
      content: 'Love the high-performance UI! Here is a snippet of how our WebSocket client handles local state propagation:\n\n```typescript\nconst channel = new BroadcastChannel("nexus_chat_ws");\nchannel.postMessage({ type: "MESSAGE_SEND", payload: newMessage });\n```',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      reactions: [
        { emoji: '🎉', count: 4, users: ['bot_nexus_ai', 'user_alex_m'] },
      ],
      status: 'read',
    },
  ],
  room_tech_talk: [
    {
      id: 'msg_tech_1',
      roomId: 'room_tech_talk',
      sender: DEFAULT_BOT_USERS[3], // Marcus
      content: 'Anyone exploring React 19 server actions vs WebSocket client architectures for high-frequency chat streams?',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      reactions: [{ emoji: '💡', count: 2, users: ['user_aria_t'] }],
      status: 'read',
    },
    {
      id: 'msg_tech_2',
      roomId: 'room_tech_talk',
      sender: DEFAULT_BOT_USERS[4], // Aria
      content: 'For chat applications, optimistic local updates combined with WebSocket broadcast guarantees sub-10ms UI latency!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      reactions: [{ emoji: '👍', count: 4, users: ['user_alex_m', 'user_marcus_v'] }],
      status: 'read',
    },
  ],
};

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
};

export const getStoredRooms = (): Room[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (!raw) return DEFAULT_ROOMS;
    const rooms = JSON.parse(raw);
    return Array.isArray(rooms) && rooms.length > 0 ? rooms : DEFAULT_ROOMS;
  } catch {
    return DEFAULT_ROOMS;
  }
};

export const setStoredRooms = (rooms: Room[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  } catch (e) {
    console.error('Failed to save rooms', e);
  }
};

export const getStoredMessages = (): Record<string, Message[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return INITIAL_MESSAGES;
    const msgs = JSON.parse(raw);
    return msgs && typeof msgs === 'object' ? msgs : INITIAL_MESSAGES;
  } catch {
    return INITIAL_MESSAGES;
  }
};

export const setStoredMessages = (messages: Record<string, Message[]>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages', e);
  }
};
