'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useChatStore } from '@/store/chatStore';
import type { NewChatRequest, SendMessageRequest } from '@/types/chat';

export function useChat() {
  const { setChats, setMessages, prependMessages, setLoading } = useChatStore();


  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/proxy/chats/', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();

      // Handle paginated response
      let chats;
      if (data && typeof data === 'object' && 'data' in data) {
        chats = data.data;
      } else if (Array.isArray(data)) {
        chats = data;
      } else {
        chats = [];
      }

      setChats(chats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [setChats, setLoading]);

  const fetchMessages = useCallback(async (chatId: number, offset = 0, limit = 50) => {
    try {
      const response = await fetch(
        `/api/proxy/chats/${chatId}/messages?offset=${offset}&limit=${limit}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      // Handle paginated response
      let messages;
      if (data && typeof data === 'object' && 'data' in data) {
        messages = data.data;
      } else if (Array.isArray(data)) {
        messages = data;
      } else {
        messages = [];
      }

      if (offset === 0) {
        setMessages(chatId, messages);
      } else {
        prependMessages(chatId, messages);
      }

      return messages;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
      return [];
    }
  }, [setMessages, prependMessages]);

  const createChat = useCallback(async (data: NewChatRequest) => {
    try {
      const response = await fetch('/api/proxy/chats/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create chat');
      }

      const responseData = await response.json();

      // Handle potentially wrapped response
      const result = responseData && typeof responseData === 'object' && 'data' in responseData
        ? responseData.data
        : responseData;

      if (!result.existed) {
        toast.success('Chat created successfully');
        await fetchChats(); // Refresh chat list
      }

      return result.chat_id;
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create chat');
      return null;
    }
  }, [fetchChats]);

  const sendMessageHTTP = useCallback(async (chatId: number, data: SendMessageRequest) => {
    try {
      const response = await fetch(`/api/proxy/chats/${chatId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, []);

  const uploadFile = useCallback(async (chatId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/proxy/chats/${chatId}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      toast.success('File uploaded successfully');
      return result;
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  }, []);

  const markAsRead = useCallback(async (chatId: number) => {
    try {
      await fetch(`/api/proxy/chats/${chatId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/proxy/chats/available-users', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available users');
      }

      const data = await response.json();

      // Handle paginated response
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch available users:', error);
      toast.error('Failed to load users');
      return [];
    }
  }, []);

  return {
    fetchChats,
    fetchMessages,
    createChat,
    sendMessageHTTP,
    uploadFile,
    markAsRead,
    fetchAvailableUsers,
  };
}
