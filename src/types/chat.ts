// Chat Types - Simple and Clean

export interface Chat {
  id: number;
  name: string;
  photo: string | null;
  description: string | null;
  chat_type: 'direct' | 'group';
  created_by: number;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  is_online: boolean;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  message: string;
  type_message: 'text' | 'file' | 'image';
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  reply_to_id: number | null;
  is_deleted: boolean;
  sender?: PubUser;
}

export interface PubUser {
  id: number;
  email: string;
  full_name: string | null;
  photo: string | null;
  course_id: number | null;
}

export interface TypingUser {
  user_id: number;
  user_name: string;
}

// WebSocket Message Types
export interface WSSendMessage {
  type: 'SendMessage';
  chat_id: number;
  message: string;
  reply_to_id?: number;
}

export interface WSTypingStart {
  type: 'TypingStart';
  chat_id: number;
}

export interface WSTypingStop {
  type: 'TypingStop';
  chat_id: number;
}

export interface WSMarkAsRead {
  type: 'MarkAsRead';
  message_id: number;
}

export interface WSJoinChat {
  type: 'JoinChat';
  chat_id: number;
}

export interface WSLeaveChat {
  type: 'LeaveChat';
  chat_id: number;
}

export interface WSPing {
  type: 'Ping';
}

export type WSClientMessage =
  | WSSendMessage
  | WSTypingStart
  | WSTypingStop
  | WSMarkAsRead
  | WSJoinChat
  | WSLeaveChat
  | WSPing;

export interface WSNewMessage {
  type: 'NewMessage';
  chat_id: number;
  message: ChatMessage;
  sender: PubUser;
}

export interface WSMessageRead {
  type: 'MessageRead';
  message_id: number;
  reader_id: number;
  read_at: string;
}

export interface WSUserTyping {
  type: 'UserTyping';
  chat_id: number;
  user_id: number;
  user_name: string;
}

export interface WSUserStoppedTyping {
  type: 'UserStoppedTyping';
  chat_id: number;
  user_id: number;
}

export interface WSUserOnline {
  type: 'UserOnline';
  user_id: number;
}

export interface WSUserOffline {
  type: 'UserOffline';
  user_id: number;
}

export interface WSError {
  type: 'Error';
  message: string;
}

export interface WSPong {
  type: 'Pong';
}

export type WSServerMessage =
  | WSNewMessage
  | WSMessageRead
  | WSUserTyping
  | WSUserStoppedTyping
  | WSUserOnline
  | WSUserOffline
  | WSError
  | WSPong;
