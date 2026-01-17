'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useChatStore } from '@/store/chatStore';
import type { WSClientMessage, WSServerMessage } from '@/types/chat';

const WS_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('https', 'wss').replace('http', 'ws') + '/api/v1/ws/chat/' || 'ws://localhost/api/v1/ws/chat/';
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const isIntentionalCloseRef = useRef(false);

  const {
    setConnected,
    addMessage,
    updateChat,
    addTypingUser,
    removeTypingUser,
    setUserOnline,
    setUserOffline,
    currentChatId,
    incrementUnreadCount,
  } = useChatStore();

  // Send heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const ping: WSClientMessage = { type: 'Ping' };
        wsRef.current.send(JSON.stringify(ping));
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = undefined;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    console.log('🔌 [WS DEBUG] Connecting to WebSocket:', WS_URL);
    console.log('📍 [WS DEBUG] Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log('🔄 [WS DEBUG] Attempt:', reconnectAttemptsRef.current + 1);

    try {
      const ws = new WebSocket(WS_URL);
      console.log('🔌 [WS DEBUG] WebSocket object created, waiting for connection...');

      ws.onopen = () => {
        console.log('✅ [WS DEBUG] WebSocket connected successfully');
        console.log('📊 [WS DEBUG] ReadyState:', ws.readyState, '(1 = OPEN)');
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        startHeartbeat();

        // Rejoin current chat if any
        if (currentChatId) {
          const joinMsg: WSClientMessage = {
            type: 'JoinChat',
            chat_id: currentChatId,
          };
          ws.send(JSON.stringify(joinMsg));
        }
      };

      ws.onmessage = (event) => {
        console.log('📩 [WS DEBUG] Raw message received:', event.data);
        try {
          const message: WSServerMessage = JSON.parse(event.data);
          console.log('📩 [WS DEBUG] Parsed message type:', message.type);

          switch (message.type) {
            case 'NewMessage':
              console.log('📨 New message received:', message);
              addMessage(message.chat_id, message.message);

              // Update last message in chat list
              updateChat(message.chat_id, {
                last_message: message.message.message,
                last_message_time: message.message.created_at,
              });

              // Increment unread count if not current chat
              if (message.chat_id !== currentChatId) {
                incrementUnreadCount(message.chat_id);
              }

              // Show notification if not current chat
              if (message.chat_id !== currentChatId && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(message.sender.full_name || 'New Message', {
                  body: message.message.message,
                  icon: message.sender.photo || '/default-avatar.png',
                });
              }
              break;

            case 'MessageRead':
              console.log('✓✓ Message read:', message);
              // Could update UI to show read receipts
              break;

            case 'UserTyping':
              addTypingUser(message.chat_id, {
                user_id: message.user_id,
                user_name: message.user_name,
                timestamp: Date.now(),
              });

              // Auto-remove after 5 seconds
              setTimeout(() => {
                removeTypingUser(message.chat_id, message.user_id);
              }, 5000);
              break;

            case 'UserStoppedTyping':
              removeTypingUser(message.chat_id, message.user_id);
              break;

            case 'UserOnline':
              setUserOnline(message.user_id);
              break;

            case 'UserOffline':
              setUserOffline(message.user_id);
              break;

            case 'Error':
              console.error('❌ WebSocket error:', message.message);
              toast.error(message.message);
              break;

            case 'Pong':
              // Heartbeat response
              break;

            default:
              console.log('Unknown message type:', message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [WS DEBUG] WebSocket error event fired');
        console.error('❌ [WS DEBUG] Error details:', {
          url: WS_URL,
          readyState: ws.readyState,
          readyStateLabel: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState],
          error: error,
          type: (error as Event).type,
        });

        // Common error messages
        console.error('💡 [WS DEBUG] Troubleshooting:');
        console.error('   1. Check if backend is running: docker-compose logs backend');
        console.error('   2. Check JWT cookie exists in browser DevTools > Application > Cookies');
        console.error('   3. For self-signed certs, visit backend URL first and accept certificate');
        console.error('   4. Check browser console Network tab for WS connection details');
        console.error('   5. Verify NEXT_PUBLIC_BACKEND_URL is correct:', process.env.NEXT_PUBLIC_BACKEND_URL);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', {
          code: event.code,
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean,
        });

        // Decode common WebSocket close codes
        const closeReasons: Record<number, string> = {
          1000: 'Normal Closure',
          1001: 'Going Away',
          1002: 'Protocol Error',
          1003: 'Unsupported Data',
          1006: 'Abnormal Closure (no close frame)',
          1007: 'Invalid Data',
          1008: 'Policy Violation',
          1009: 'Message Too Big',
          1010: 'Missing Extension',
          1011: 'Internal Server Error',
          1015: 'TLS Handshake Failed',
        };

        if (closeReasons[event.code]) {
          console.log(`   → ${closeReasons[event.code]}`);
        }

        setConnected(false);
        stopHeartbeat();
        wsRef.current = null;

        // Don't reconnect if intentional close
        if (isIntentionalCloseRef.current) {
          isIntentionalCloseRef.current = false;
          return;
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached');
          toast.error('Connection lost. Please refresh the page.');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setConnected(false);
    }
  }, [
    setConnected,
    addMessage,
    updateChat,
    addTypingUser,
    removeTypingUser,
    setUserOnline,
    setUserOffline,
    currentChatId,
    incrementUnreadCount,
    startHeartbeat,
    stopHeartbeat,
  ]);

  const disconnect = useCallback(() => {
    isIntentionalCloseRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setConnected(false);
  }, [setConnected, stopHeartbeat]);

  const sendMessage = useCallback((message: WSClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket not connected, cannot send message');
      toast.error('Connection lost. Reconnecting...');
      return false;
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect when currentChatId changes
  useEffect(() => {
    if (currentChatId && wsRef.current?.readyState === WebSocket.OPEN) {
      const joinMsg: WSClientMessage = {
        type: 'JoinChat',
        chat_id: currentChatId,
      };
      sendMessage(joinMsg);
    }
  }, [currentChatId, sendMessage]);

  return {
    sendMessage,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
  };
}
