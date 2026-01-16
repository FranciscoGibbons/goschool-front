// Chat system TypeScript types

export interface Chat {
  readonly id: number;
  readonly name: string;
  readonly photo: string | null;
  readonly description: string | null;
  readonly chat_type: 'direct' | 'group';
  readonly created_by: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly last_message: string | null;
  readonly last_message_time: string | null;
  readonly unread_count: number;
  readonly is_online: boolean;
  readonly participants?: ChatParticipant[];
}

export interface ChatMessage {
  readonly id: number;
  readonly chat_id: number;
  readonly sender_id: number;
  readonly message: string;
  readonly type_message: 'text' | 'file' | 'image';
  readonly file_path: string | null;
  readonly file_name: string | null;
  readonly file_size: number | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly reply_to_id: number | null;
  readonly is_deleted: boolean;
  readonly sender?: PubUser;
  readonly read_by?: ReadReceipt[];
}

export interface ChatParticipant {
  readonly id: number;
  readonly user_id: number;
  readonly chat_id: number;
  readonly joined_at: string;
  readonly last_read_at: string | null;
  readonly is_admin: boolean;
  readonly user?: PubUser;
}

export interface ReadReceipt {
  readonly message_id: number;
  readonly reader_id: number;
  readonly read_at: string;
  readonly reader?: PubUser;
}

export interface PubUser {
  readonly id: number;
  readonly email: string;
  readonly full_name: string;
  readonly photo: string | null;
  readonly course_id: number | null;
}

export interface TypingUser {
  readonly user_id: number;
  readonly user_name: string;
  readonly timestamp: number;
}

export interface NewChatRequest {
  participant_ids: number[];
  chat_type: 'direct' | 'group';
  name?: string;
  description?: string;
}

export interface SendMessageRequest {
  chat_id: number;
  message: string;
  type_message?: string;
  reply_to_id?: number;
}

// WebSocket message types
export type WSClientMessage =
  | { type: 'SendMessage'; chat_id: number; message: string; reply_to_id?: number }
  | { type: 'TypingStart'; chat_id: number }
  | { type: 'TypingStop'; chat_id: number }
  | { type: 'MarkAsRead'; message_id: number }
  | { type: 'JoinChat'; chat_id: number }
  | { type: 'LeaveChat'; chat_id: number }
  | { type: 'Ping' };

export type WSServerMessage =
  | { type: 'NewMessage'; chat_id: number; message: ChatMessage; sender: PubUser }
  | { type: 'MessageRead'; message_id: number; reader_id: number; read_at: string }
  | { type: 'UserTyping'; chat_id: number; user_id: number; user_name: string }
  | { type: 'UserStoppedTyping'; chat_id: number; user_id: number }
  | { type: 'UserOnline'; user_id: number }
  | { type: 'UserOffline'; user_id: number }
  | { type: 'Error'; message: string }
  | { type: 'Pong' };

// Helper types for UI state
export interface ChatState {
  chats: Chat[];
  currentChatId: number | null;
  messages: Record<number, ChatMessage[]>;
  typingUsers: Record<number, TypingUser[]>;
  onlineUsers: Set<number>;
  isConnected: boolean;
  isLoading: boolean;
}

export interface MessageQueryParams {
  limit?: number;
  offset?: number;
}
