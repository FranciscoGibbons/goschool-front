'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import type { Chat, ChatMessage, PubUser } from '@/types/chat';

export function useChat() {
  const { setChats, setMessages, prependMessages, setLoading } = useChatStore();

  const fetchChats = useCallback(async (): Promise<Chat[]> => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/chats/', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch chats');
      const data = await res.json();
      const chats = Array.isArray(data) ? data : (data.data || []);
      setChats(chats);
      return chats;
    } catch (err) {
      console.error('fetchChats error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setChats, setLoading]);

  const fetchMessages = useCallback(async (
    chatId: number,
    offset = 0,
    limit = 50
  ): Promise<ChatMessage[]> => {
    try {
      const res = await fetch(
        `/api/proxy/chats/${chatId}/messages?offset=${offset}&limit=${limit}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      const messages = Array.isArray(data) ? data : (data.data || []);

      if (offset === 0) {
        setMessages(chatId, messages);
      } else {
        prependMessages(chatId, messages);
      }
      return messages;
    } catch (err) {
      console.error('fetchMessages error:', err);
      return [];
    }
  }, [setMessages, prependMessages]);

  const sendMessage = useCallback(async (
    chatId: number,
    message: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/proxy/chats/${chatId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type_message: 'text' }),
      });
      return res.ok;
    } catch (err) {
      console.error('sendMessage error:', err);
      return false;
    }
  }, []);

  const createChat = useCallback(async (
    participantIds: number[],
    chatType: 'direct' | 'group',
    name?: string
  ): Promise<number | null> => {
    try {
      const res = await fetch('/api/proxy/chats/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_ids: participantIds,
          chat_type: chatType,
          name,
        }),
      });
      if (!res.ok) throw new Error('Failed to create chat');
      const data = await res.json();
      const result = data.data || data;
      return result.chat_id;
    } catch (err) {
      console.error('createChat error:', err);
      return null;
    }
  }, []);

  const uploadFile = useCallback(async (
    chatId: number,
    file: File
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/proxy/chats/${chatId}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      return res.ok;
    } catch (err) {
      console.error('uploadFile error:', err);
      return false;
    }
  }, []);

  const markAsRead = useCallback(async (chatId: number): Promise<void> => {
    try {
      await fetch(`/api/proxy/chats/${chatId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  }, []);

  const fetchAvailableUsers = useCallback(async (): Promise<PubUser[]> => {
    try {
      const res = await fetch('/api/proxy/chats/available-users', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (err) {
      console.error('fetchAvailableUsers error:', err);
      return [];
    }
  }, []);

  return {
    fetchChats,
    fetchMessages,
    sendMessage,
    createChat,
    uploadFile,
    markAsRead,
    fetchAvailableUsers,
  };
}
