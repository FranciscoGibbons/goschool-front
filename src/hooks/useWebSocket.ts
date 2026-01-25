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

// Singleton WebSocket manager to avoid multiple connections
let wsInstance: WebSocket | null = null;
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let wsPingTimer: ReturnType<typeof setInterval> | null = null;
let wsAttempts = 0;
const wsListeners: Set<(event: MessageEvent) => void> = new Set();

function connectWs() {
  if (wsInstance?.readyState === WebSocket.OPEN) return;
  if (wsInstance?.readyState === WebSocket.CONNECTING) return;

  const url = getWsUrl();
  if (!url) return;

  console.log('[WS] Connecting to:', url);

  try {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('[WS] Connected');
      useChatStore.getState().setConnected(true);
      wsAttempts = 0;

      // Ping every 25s
      if (wsPingTimer) clearInterval(wsPingTimer);
      wsPingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'Ping' }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      wsListeners.forEach(listener => listener(event));
    };

    ws.onerror = () => {
      console.error('[WS] Error');
    };

    ws.onclose = (e) => {
      console.log('[WS] Closed:', e.code);
      useChatStore.getState().setConnected(false);
      wsInstance = null;

      if (wsPingTimer) {
        clearInterval(wsPingTimer);
        wsPingTimer = null;
      }

      // Reconnect with backoff
      if (wsAttempts < 10) {
        const delay = Math.min(3000 * Math.pow(1.5, wsAttempts), 30000);
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${wsAttempts + 1})`);
        wsReconnectTimer = setTimeout(() => {
          wsAttempts++;
          connectWs();
        }, delay);
      }
    };

    wsInstance = ws;
  } catch (err) {
    console.error('[WS] Connect error:', err);
  }
}

function disconnectWs() {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  if (wsPingTimer) {
    clearInterval(wsPingTimer);
    wsPingTimer = null;
  }
  if (wsInstance) {
    wsInstance.close(1000);
    wsInstance = null;
  }
  useChatStore.getState().setConnected(false);
}

function sendWs(msg: WSClientMessage): boolean {
  if (wsInstance?.readyState === WebSocket.OPEN) {
    wsInstance.send(JSON.stringify(msg));
    return true;
  }
  return false;
}

function reconnectWs() {
  wsAttempts = 0;
  disconnectWs();
  setTimeout(connectWs, 100);
}

export function useWebSocket() {
  const currentChatIdRef = useRef<number | null>(null);

  // Subscribe to currentChatId changes
  useEffect(() => {
    return useChatStore.subscribe((state) => {
      currentChatIdRef.current = state.currentChatId;
    });
  }, []);

  // Message handler
  const handleMessage = useCallback((event: MessageEvent) => {
    const store = useChatStore.getState();
    try {
      const msg: WSServerMessage = JSON.parse(event.data);

      switch (msg.type) {
        case 'NewMessage': {
          const fullMessage: ChatMessage = { ...msg.message, sender: msg.sender };
          store.addMessage(msg.chat_id, fullMessage);
          store.updateChat(msg.chat_id, {
            last_message: msg.message.message || '[Archivo]',
            last_message_time: msg.message.created_at,
          });
          if (msg.chat_id !== currentChatIdRef.current) {
            store.incrementUnread(msg.chat_id);
          }
          break;
        }
        case 'UserTyping':
          store.addTypingUser(msg.chat_id, { user_id: msg.user_id, user_name: msg.user_name });
          setTimeout(() => store.removeTypingUser(msg.chat_id, msg.user_id), 5000);
          break;
        case 'UserStoppedTyping':
          store.removeTypingUser(msg.chat_id, msg.user_id);
          break;
        case 'UserOnline':
          store.setUserOnline(msg.user_id);
          break;
        case 'UserOffline':
          store.setUserOffline(msg.user_id);
          break;
        case 'Error':
          console.error('[WS] Server error:', msg.message);
          break;
        case 'Pong':
        case 'MessageRead':
          break;
      }
    } catch (err) {
      console.error('[WS] Parse error:', err);
    }
  }, []);

  // Setup connection and listener
  useEffect(() => {
    wsListeners.add(handleMessage);
    connectWs();

    return () => {
      wsListeners.delete(handleMessage);
      // Only disconnect if no more listeners
      if (wsListeners.size === 0) {
        disconnectWs();
      }
    };
  }, [handleMessage]);

  const sendMessage = useCallback((chatId: number, message: string) => {
    return sendWs({ type: 'SendMessage', chat_id: chatId, message });
  }, []);

  const startTyping = useCallback((chatId: number) => {
    return sendWs({ type: 'TypingStart', chat_id: chatId });
  }, []);

  const stopTyping = useCallback((chatId: number) => {
    return sendWs({ type: 'TypingStop', chat_id: chatId });
  }, []);

  const joinChat = useCallback((chatId: number) => {
    return sendWs({ type: 'JoinChat', chat_id: chatId });
  }, []);

  return {
    send: sendWs,
    sendMessage,
    startTyping,
    stopTyping,
    joinChat,
    reconnect: reconnectWs,
  };
}
