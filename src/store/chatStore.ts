import { create } from 'zustand';
import type { Chat, ChatMessage, TypingUser } from '@/types/chat';

interface ChatStore {
  // State
  chats: Chat[];
  messages: Record<number, ChatMessage[]>;
  currentChatId: number | null;
  typingUsers: Record<number, TypingUser[]>;
  onlineUsers: number[];
  isConnected: boolean;
  isLoading: boolean;

  // Actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: number, updates: Partial<Chat>) => void;

  setMessages: (chatId: number, messages: ChatMessage[]) => void;
  addMessage: (chatId: number, message: ChatMessage) => void;
  prependMessages: (chatId: number, messages: ChatMessage[]) => void;

  setCurrentChat: (chatId: number | null) => void;

  addTypingUser: (chatId: number, user: TypingUser) => void;
  removeTypingUser: (chatId: number, userId: number) => void;

  setUserOnline: (userId: number) => void;
  setUserOffline: (userId: number) => void;

  incrementUnread: (chatId: number) => void;
  resetUnread: (chatId: number) => void;

  markChatMessagesRead: (chatId: number, readerId: number) => void;
  updateChatOnlineStatus: (userId: number, isOnline: boolean, lastSeenAt?: string) => void;

  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;

  reset: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  messages: {},
  currentChatId: null,
  typingUsers: {},
  onlineUsers: [],
  isConnected: false,
  isLoading: false,

  setChats: (chats) => set({ chats }),

  addChat: (chat) => set((state) => ({
    chats: [chat, ...state.chats.filter(c => c.id !== chat.id)]
  })),

  updateChat: (chatId, updates) => set((state) => ({
    chats: state.chats.map(c => c.id === chatId ? { ...c, ...updates } : c)
  })),

  setMessages: (chatId, messages) => set((state) => ({
    messages: { ...state.messages, [chatId]: messages }
  })),

  addMessage: (chatId, message) => set((state) => {
    const existing = state.messages[chatId] || [];
    if (existing.some(m => m.id === message.id)) return state;
    return {
      messages: { ...state.messages, [chatId]: [...existing, message] }
    };
  }),

  prependMessages: (chatId, messages) => set((state) => {
    const existing = state.messages[chatId] || [];
    const newMsgs = messages.filter(m => !existing.some(e => e.id === m.id));
    return {
      messages: { ...state.messages, [chatId]: [...newMsgs, ...existing] }
    };
  }),

  setCurrentChat: (chatId) => {
    set({ currentChatId: chatId });
    if (chatId) get().resetUnread(chatId);
  },

  addTypingUser: (chatId, user) => set((state) => {
    const current = state.typingUsers[chatId] || [];
    const filtered = current.filter(u => u.user_id !== user.user_id);
    return {
      typingUsers: { ...state.typingUsers, [chatId]: [...filtered, user] }
    };
  }),

  removeTypingUser: (chatId, userId) => set((state) => ({
    typingUsers: {
      ...state.typingUsers,
      [chatId]: (state.typingUsers[chatId] || []).filter(u => u.user_id !== userId)
    }
  })),

  setUserOnline: (userId) => set((state) => ({
    onlineUsers: state.onlineUsers.includes(userId)
      ? state.onlineUsers
      : [...state.onlineUsers, userId]
  })),

  setUserOffline: (userId) => set((state) => ({
    onlineUsers: state.onlineUsers.filter(id => id !== userId)
  })),

  incrementUnread: (chatId) => set((state) => ({
    chats: state.chats.map(c =>
      c.id === chatId ? { ...c, unread_count: (c.unread_count || 0) + 1 } : c
    )
  })),

  resetUnread: (chatId) => set((state) => ({
    chats: state.chats.map(c =>
      c.id === chatId ? { ...c, unread_count: 0 } : c
    )
  })),

  markChatMessagesRead: (chatId, readerId) => set((state) => {
    const chatMessages = state.messages[chatId];
    if (!chatMessages) return state;
    return {
      messages: {
        ...state.messages,
        [chatId]: chatMessages.map(m =>
          m.sender_id !== readerId ? { ...m, is_read: true } : m
        ),
      },
    };
  }),

  updateChatOnlineStatus: (userId, isOnline, lastSeenAt) => set((state) => ({
    chats: state.chats.map(c =>
      c.chat_type === 'direct' && c.other_user_id === userId
        ? { ...c, is_online: isOnline, ...(lastSeenAt !== undefined ? { last_seen_at: lastSeenAt } : {}) }
        : c
    ),
  })),

  setConnected: (connected) => set({ isConnected: connected }),
  setLoading: (loading) => set({ isLoading: loading }),

  reset: () => set({
    chats: [],
    messages: {},
    currentChatId: null,
    typingUsers: {},
    onlineUsers: [],
    isConnected: false,
    isLoading: false,
  }),
}));
