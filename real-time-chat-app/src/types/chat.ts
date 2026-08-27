export type UserStatus = 'online' | 'away' | 'dnd' | 'offline';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: UserStatus;
  statusText?: string;
  isBot?: boolean;
  lastSeen?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // array of userIds
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'audio' | 'code';
  size?: string;
  mimeType?: string;
}

export interface ThreadReply {
  id: string;
  messageId: string;
  sender: User;
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
}

export interface Message {
  id: string;
  roomId: string;
  sender: User;
  content: string;
  timestamp: string;
  isSystem?: boolean;
  reactions: Reaction[];
  attachments?: FileAttachment[];
  isPinned?: boolean;
  isEdited?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  threadCount?: number;
  lastThreadTimestamp?: string;
  threadReplies?: ThreadReply[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  isPrivate?: boolean;
  isDirectMessage?: boolean;
  dmUserId?: string; // If DM, the recipient user id
  password?: string;
  icon?: string;
  unreadCount?: number;
  createdBy?: string;
  membersCount?: number;
  category?: 'channels' | 'direct_messages';
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  roomId: string;
  timestamp: number;
}

export interface ToastNotification {
  id: string;
  title: string;
  description: string;
  senderName?: string;
  senderAvatar?: string;
  roomId?: string;
  timestamp: string;
}

export type ActiveTab = 'chat' | 'members' | 'media' | 'pinned' | 'thread';
