'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MoreVertical, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatStore, useCurrentMessages, useCurrentTypingUsers } from '@/store/chatStore';
import { useChat } from '@/hooks/useChat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  chatId: number;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const chat = useChatStore((state) =>
    state.chats.find((c) => c.id === chatId)
  );
  const messages = useCurrentMessages();
  const typingUsers = useCurrentTypingUsers();
  const { setCurrentChat } = useChatStore();
  const { fetchMessages, markAsRead } = useChat();

  // Initial message load
  useEffect(() => {
    fetchMessages(chatId, 0, 50);
    markAsRead(chatId);
  }, [chatId, fetchMessages, markAsRead]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Load more messages on scroll
  const handleScroll = async () => {
    if (!messagesContainerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop } = messagesContainerRef.current;

    if (scrollTop < 100) {
      setIsLoadingMore(true);
      const oldMessages = await fetchMessages(chatId, messages.length, 50);

      if (oldMessages.length < 50) {
        setHasMore(false);
      }

      setIsLoadingMore(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!chat) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCurrentChat(null)}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.photo || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(chat.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold">{chat.name}</h2>
            {chat.chat_type === 'group' && (
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <Users className="h-3 w-3" />
                {chat.participants?.length || 0} members
              </p>
            )}
          </div>
        </div>

        <Button size="icon" variant="ghost">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface"
      >
        {isLoadingMore && (
          <div className="text-center py-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        )}

        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              showAvatar={showAvatar}
            />
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput chatId={chatId} />
    </div>
  );
}
