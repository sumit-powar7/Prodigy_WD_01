import { User, Message, Room, TypingIndicator, UserStatus } from '../types/chat';

export type WSEventType =
  | 'CONNECT'
  | 'DISCONNECT'
  | 'MESSAGE_SEND'
  | 'MESSAGE_UPDATE'
  | 'MESSAGE_DELETE'
  | 'TYPING_START'
  | 'TYPING_STOP'
  | 'STATUS_CHANGE'
  | 'ROOM_CREATE'
  | 'REACTION_TOGGLE'
  | 'PIN_TOGGLE'
  | 'THREAD_REPLY';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  senderId: string;
  tabId: string;
  timestamp: number;
  payload: T;
}

type EventListenerCallback = (event: WSEvent) => void;

class WebSocketMockServer {
  private listeners: Map<string, Set<EventListenerCallback>> = new Map();
  private channel: BroadcastChannel | null = null;
  private tabId: string;

  constructor() {
    this.tabId = 'tab_' + Math.random().toString(36).substring(2, 9);
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('nexus_chat_websocket_channel');
      this.channel.onmessage = (e: MessageEvent) => {
        const wsEvent = e.data as WSEvent;
        if (wsEvent && wsEvent.tabId !== this.tabId) {
          this.emitLocal(wsEvent);
        }
      };
    }

    // Cross-tab fallback via storage events if BroadcastChannel unavailable
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'nexus_ws_event' && e.newValue) {
          try {
            const wsEvent = JSON.parse(e.newValue) as WSEvent;
            if (wsEvent && wsEvent.tabId !== this.tabId) {
              this.emitLocal(wsEvent);
            }
          } catch {
            // ignore
          }
        }
      });
    }
  }

  public subscribe(eventType: WSEventType | '*', callback: EventListenerCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public broadcast<T>(type: WSEventType, senderId: string, payload: T) {
    const event: WSEvent<T> = {
      type,
      senderId,
      tabId: this.tabId,
      timestamp: Date.now(),
      payload,
    };

    // Emit locally
    this.emitLocal(event);

    // Broadcast across tabs
    if (this.channel) {
      this.channel.postMessage(event);
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_ws_event', JSON.stringify(event));
    }

    // Trigger AI Bot auto-response if applicable
    this.handleBotSimulation(event);
  }

  private emitLocal(event: WSEvent) {
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach((cb) => cb(event));
    }
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach((cb) => cb(event));
    }
  }

  private handleBotSimulation(event: WSEvent) {
    if (event.type === 'MESSAGE_SEND') {
      const msg = event.payload as Message;
      const isMentioned = msg.content.toLowerCase().includes('@nexus ai') || msg.content.toLowerCase().includes('@bot');
      const isDMBot = msg.roomId.startsWith('dm_bot_nexus_ai');

      if ((isMentioned || isDMBot) && !msg.sender.isBot) {
        // Trigger typing indicator
        setTimeout(() => {
          this.broadcast<TypingIndicator>('TYPING_START', 'bot_nexus_ai', {
            userId: 'bot_nexus_ai',
            userName: 'Nexus AI Bot',
            roomId: msg.roomId,
            timestamp: Date.now(),
          });
        }, 600);

        // Send AI response after 1.8 seconds
        setTimeout(() => {
          this.broadcast<TypingIndicator>('TYPING_STOP', 'bot_nexus_ai', {
            userId: 'bot_nexus_ai',
            userName: 'Nexus AI Bot',
            roomId: msg.roomId,
            timestamp: Date.now(),
          });

          const botResponses = [
            `Hello ${msg.sender.name}! 👋 I am Nexus AI Bot. I'm actively monitoring real-time events, WebSocket state sync, and channel broadcasts. Let me know if you need code snippets or feature tests!`,
            `Great message, ${msg.sender.name}! Multi-tab state broadcast is confirmed active. Everything is synced seamlessly across your sessions. ⚡`,
            `🤖 Beep boop! Thanks for reaching out. Did you know you can pin messages, react with emojis, upload file previews, and search through global chat history?`,
            `Hey ${msg.sender.name}! I detected your ping. Try creating a new channel or switching between dark/light themes in the top header menu!`,
          ];

          const responseText = botResponses[Math.floor(Math.random() * botResponses.length)];

          const botMsg: Message = {
            id: 'msg_bot_' + Date.now(),
            roomId: msg.roomId,
            sender: {
              id: 'bot_nexus_ai',
              name: 'Nexus AI Bot',
              username: 'nexus_ai',
              avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
              status: 'online',
              statusText: '🤖 Ask me anything',
              isBot: true,
            },
            content: responseText,
            timestamp: new Date().toISOString(),
            reactions: [{ emoji: '⚡', count: 1, users: ['bot_nexus_ai'] }],
            status: 'read',
          };

          this.broadcast<Message>('MESSAGE_SEND', 'bot_nexus_ai', botMsg);
        }, 2200);
      }
    }
  }
}

export const wsService = new WebSocketMockServer();
