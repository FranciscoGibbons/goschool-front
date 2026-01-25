'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import type { WSClientMessage, WSServerMessage, ChatMessage } from '@/types/chat';

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl) {
    return backendUrl.replace('https', 'wss').replace('http', 'ws') + '/api/v1/ws/chat/';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/v1/ws/chat/`;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const {
    setConnected,
    addMessage,
    updateChat,
    addTypingUser,
    removeTypingUser,
    setUserOnline,
    setUserOffline,
    incrementUnread,
    currentChatId,
  } = useChatStore();

  const currentChatIdRef = useRef(currentChatId);
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  const send = useCallback((msg: WSClientMessage): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const msg: WSServerMessage = JSON.parse(event.data);

      switch (msg.type) {
        case 'NewMessage': {
          const fullMessage: ChatMessage = { ...msg.message, sender: msg.sender };
          addMessage(msg.chat_id, fullMessage);
          updateChat(msg.chat_id, {
            last_message: msg.message.message || '[Archivo]',
            last_message_time: msg.message.created_at,
          });
          if (msg.chat_id !== currentChatIdRef.current) {
            incrementUnread(msg.chat_id);
          }
          break;
        }
        case 'UserTyping':
          addTypingUser(msg.chat_id, { user_id: msg.user_id, user_name: msg.user_name });
          setTimeout(() => removeTypingUser(msg.chat_id, msg.user_id), 5000);
          break;
        case 'UserStoppedTyping':
          removeTypingUser(msg.chat_id, msg.user_id);
          break;
        case 'UserOnline':
          setUserOnline(msg.user_id);
          break;
        case 'UserOffline':
          setUserOffline(msg.user_id);
          break;
        case 'Error':
          console.error('WS Error:', msg.message);
          break;
        case 'Pong':
          break;
        case 'MessageRead':
          break;
      }
    } catch (err) {
      console.error('WS parse error:', err);
    }
  }, [addMessage, updateChat, addTypingUser, removeTypingUser, setUserOnline, setUserOffline, incrementUnread]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const url = getWsUrl();
    if (!url) return;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WS connected');
        setConnected(true);
        attemptsRef.current = 0;

        // Ping every 25s
        pingTimer.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'Ping' }));
          }
        }, 25000);
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {
        console.error('WS error');
      };

      ws.onclose = () => {
        console.log('WS closed');
        setConnected(false);
        wsRef.current = null;

        if (pingTimer.current) {
          clearInterval(pingTimer.current);
          pingTimer.current = null;
        }

        // Reconnect
        if (attemptsRef.current < 10) {
          const delay = Math.min(3000 * Math.pow(1.5, attemptsRef.current), 30000);
          reconnectTimer.current = setTimeout(() => {
            attemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WS connect error:', err);
    }
  }, [setConnected, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (pingTimer.current) {
      clearInterval(pingTimer.current);
      pingTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, [setConnected]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const sendMessage = useCallback((chatId: number, message: string) => {
    return send({ type: 'SendMessage', chat_id: chatId, message });
  }, [send]);

  const startTyping = useCallback((chatId: number) => {
    return send({ type: 'TypingStart', chat_id: chatId });
  }, [send]);

  const stopTyping = useCallback((chatId: number) => {
    return send({ type: 'TypingStop', chat_id: chatId });
  }, [send]);

  const joinChat = useCallback((chatId: number) => {
    return send({ type: 'JoinChat', chat_id: chatId });
  }, [send]);

  return {
    send,
    sendMessage,
    startTyping,
    stopTyping,
    joinChat,
    reconnect: connect,
  };
}
