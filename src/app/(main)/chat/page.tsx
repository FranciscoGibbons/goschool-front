'use client';

import { useEffect, useState } from 'react';
import { MessageSquarePlus, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/chatStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useChat } from '@/hooks/useChat';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import NewChatModal from './components/NewChatModal';

export default function ChatPage() {
  const [showNewChat, setShowNewChat] = useState(false);
  const { currentChatId, chats } = useChatStore();

  const { isConnected: wsConnected } = useWebSocket();
  const { fetchChats } = useChat();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">

          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold">Chats</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                {wsConnected ? (
                  <>
                    <Wifi className="h-3.5 w-3.5 text-success" />
                    <span className="text-text-secondary">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-destructive">Offline</span>
                  </>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowNewChat(true)}
                className="h-8 w-8"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>

        {/* Chat List */}
        <ChatList />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {currentChatId ? (
          <ChatWindow chatId={currentChatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquarePlus className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
                <p className="text-text-secondary mb-4">
                  Select a conversation to start messaging
                </p>
                <Button onClick={() => setShowNewChat(true)}>
                  Start New Chat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal
          isOpen={showNewChat}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  );
}
