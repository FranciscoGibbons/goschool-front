import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Chat, ChatMessage, TypingUser } from '@/types/chat';

interface ChatState {
  // State
  chats: Chat[];
  currentChatId: number | null;
  messages: Record<number, ChatMessage[]>;
  typingUsers: Record<number, TypingUser[]>;
  onlineUsers: Set<number>;
  isConnected: boolean;
  isLoading: boolean;

  // Actions - Chats
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: number, updates: Partial<Chat>) => void;
  setCurrentChat: (chatId: number | null) => void;

  // Actions - Messages
  addMessage: (chatId: number, message: ChatMessage) => void;
  updateMessage: (chatId: number, messageId: number, updates: Partial<ChatMessage>) => void;
  setMessages: (chatId: number, messages: ChatMessage[]) => void;
  prependMessages: (chatId: number, messages: ChatMessage[]) => void;

  // Actions - Typing
  addTypingUser: (chatId: number, user: TypingUser) => void;
  removeTypingUser: (chatId: number, userId: number) => void;
  clearTypingUsers: (chatId: number) => void;

  // Actions - Online Status
  setUserOnline: (userId: number) => void;
  setUserOffline: (userId: number) => void;

  // Actions - Connection
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;

  // Actions - Unread
  incrementUnreadCount: (chatId: number) => void;
  resetUnreadCount: (chatId: number) => void;

  // Actions - Clear
  clearAllMessages: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      currentChatId: null,
      messages: {},
      typingUsers: {},
      onlineUsers: new Set(),
      isConnected: false,
      isLoading: false,

      // Chat actions
      setChats: (chats) => set({ chats }),

      addChat: (chat) => set((state) => ({
        chats: [chat, ...state.chats],
      })),

      updateChat: (chatId, updates) => set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, ...updates } : chat
        ),
      })),

      setCurrentChat: (chatId) => {
        set({ currentChatId: chatId });
        if (chatId) {
          // Reset unread count when opening a chat
          get().resetUnreadCount(chatId);
        }
      },

      // Message actions
      addMessage: (chatId, message) => set((state) => {
        const chatMessages = state.messages[chatId] || [];

        // Check if message already exists (prevent duplicates)
        if (chatMessages.some((m) => m.id === message.id)) {
          return state;
        }

        return {
          messages: {
            ...state.messages,
            [chatId]: [...chatMessages, message],
          },
        };
      }),

      updateMessage: (chatId, messageId, updates) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: state.messages[chatId]?.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ) || [],
        },
      })),

      setMessages: (chatId, messages) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: messages,
        },
      })),

      prependMessages: (chatId, messages) => set((state) => {
        const existing = state.messages[chatId] || [];
        // Avoid duplicates
        const newMessages = messages.filter(
          (msg) => !existing.some((m) => m.id === msg.id)
        );
        return {
          messages: {
            ...state.messages,
            [chatId]: [...newMessages, ...existing],
          },
        };
      }),

      // Typing actions
      addTypingUser: (chatId, user) => set((state) => {
        const chatTypingUsers = state.typingUsers[chatId] || [];
        // Remove existing entry for this user
        const filtered = chatTypingUsers.filter((u) => u.user_id !== user.user_id);

        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: [...filtered, user],
          },
        };
      }),

      removeTypingUser: (chatId, userId) => set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [chatId]: (state.typingUsers[chatId] || []).filter(
            (u) => u.user_id !== userId
          ),
        },
      })),

      clearTypingUsers: (chatId) => set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [chatId]: [],
        },
      })),

      // Online status actions
      setUserOnline: (userId) => set((state) => {
        const newSet = new Set(state.onlineUsers);
        newSet.add(userId);
        return { onlineUsers: newSet };
      }),

      setUserOffline: (userId) => set((state) => {
        const newSet = new Set(state.onlineUsers);
        newSet.delete(userId);
        return { onlineUsers: newSet };
      }),

      // Connection actions
      setConnected: (connected) => set({ isConnected: connected }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Unread actions
      incrementUnreadCount: (chatId) => set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, unread_count: chat.unread_count + 1 }
            : chat
        ),
      })),

      resetUnreadCount: (chatId) => set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, unread_count: 0 } : chat
        ),
      })),

      // Clear actions
      clearAllMessages: () => set({ messages: {} }),

      reset: () => set({
        chats: [],
        currentChatId: null,
        messages: {},
        typingUsers: {},
        onlineUsers: new Set(),
        isConnected: false,
        isLoading: false,
      }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chats: state.chats,
        messages: state.messages,
        currentChatId: state.currentChatId,
      }),
      // Custom serializer to handle Set
      serialize: (state) => {
        const onlineUsersArray = Array.from(state.state.onlineUsers || []);
        return JSON.stringify({
          ...state,
          state: {
            ...state.state,
            onlineUsers: onlineUsersArray,
          },
        });
      },
      // Custom deserializer to recreate Set
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        if (parsed.state.onlineUsers && Array.isArray(parsed.state.onlineUsers)) {
          parsed.state.onlineUsers = new Set(parsed.state.onlineUsers);
        } else {
          parsed.state.onlineUsers = new Set();
        }
        return parsed;
      },
    }
  )
);

// Selectors for better performance
export const useCurrentChat = () =>
  useChatStore((state) => {
    if (!state.currentChatId) return null;
    return state.chats.find((chat) => chat.id === state.currentChatId);
  });

export const useCurrentMessages = () =>
  useChatStore((state) => {
    if (!state.currentChatId) return [];
    return state.messages[state.currentChatId] || [];
  });

export const useCurrentTypingUsers = () =>
  useChatStore((state) => {
    if (!state.currentChatId) return [];
    return state.typingUsers[state.currentChatId] || [];
  });

export const useChatById = (chatId: number | null) =>
  useChatStore((state) => {
    if (!chatId) return null;
    return state.chats.find((chat) => chat.id === chatId);
  });

export const useUnreadCount = () =>
  useChatStore((state) =>
    state.chats.reduce((total, chat) => total + chat.unread_count, 0)
  );
