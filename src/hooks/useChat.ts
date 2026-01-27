'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import type { Chat, ChatMessage, PubUser } from '@/types/chat';

export function useChat() {
  const { setChats, setMessages, prependMessages, setLoading } = useChatStore();
  const router = useRouter();

  const handleUnauthorized = useCallback((res: Response): boolean => {
    if (res.status === 401) {
      router.push('/login');
      return true;
    }
    return false;
  }, [router]);

  const fetchChats = useCallback(async (): Promise<Chat[]> => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/chats/', { credentials: 'include' });
      if (handleUnauthorized(res)) return [];
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
  }, [setChats, setLoading, handleUnauthorized]);

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
      if (handleUnauthorized(res)) return [];
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
  }, [setMessages, prependMessages, handleUnauthorized]);

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
      if (handleUnauthorized(res)) return false;
      return res.ok;
    } catch (err) {
      console.error('sendMessage error:', err);
      return false;
    }
  }, [handleUnauthorized]);

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
      if (handleUnauthorized(res)) return null;
      if (!res.ok) throw new Error('Failed to create chat');
      const data = await res.json();
      const result = data.data || data;
      return result.chat_id;
    } catch (err) {
      console.error('createChat error:', err);
      return null;
    }
  }, [handleUnauthorized]);

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
      if (handleUnauthorized(res)) return false;
      return res.ok;
    } catch (err) {
      console.error('uploadFile error:', err);
      return false;
    }
  }, [handleUnauthorized]);

  const markAsRead = useCallback(async (chatId: number): Promise<void> => {
    try {
      const res = await fetch(`/api/proxy/chats/${chatId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      handleUnauthorized(res);
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  }, [handleUnauthorized]);

  const fetchAvailableUsers = useCallback(async (): Promise<PubUser[]> => {
    try {
      const res = await fetch('/api/proxy/chats/available-users', {
        credentials: 'include',
      });
      if (handleUnauthorized(res)) return [];
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (err) {
      console.error('fetchAvailableUsers error:', err);
      return [];
    }
  }, [handleUnauthorized]);

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
