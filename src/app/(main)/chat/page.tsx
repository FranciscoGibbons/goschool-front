'use client';

import { useEffect, useState, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MessageSquarePlus,
  Send,
  Paperclip,
  ArrowLeft,
  Search,
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChatStore } from '@/store/chatStore';
import { useChat } from '@/hooks/useChat';
import { useWebSocket } from '@/hooks/useWebSocket';
import userInfoStore from '@/store/userInfoStore';
import type { Chat, ChatMessage, PubUser, TypingUser } from '@/types/chat';

// ============ HELPER FUNCTIONS ============

function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(date: string): string {
  try {
    return format(new Date(date), 'HH:mm', { locale: es });
  } catch {
    return '';
  }
}

function formatRelative(date: string | null): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

// ============ CHAT LIST COMPONENT ============

function ChatList({
  chats,
  currentChatId,
  onSelect,
}: {
  chats: Chat[];
  currentChatId: number | null;
  onSelect: (id: number) => void;
}) {
  const sorted = [...chats].sort((a, b) => {
    const ta = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
    const tb = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
    return tb - ta;
  });

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground text-sm">
        No hay conversaciones
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {sorted.map(chat => (
        <button
          key={chat.id}
          onClick={() => onSelect(chat.id)}
          className={`w-full p-3 flex items-center gap-3 hover:bg-accent/50 border-b border-border ${
            chat.id === currentChatId ? 'bg-accent' : ''
          }`}
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={chat.photo || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {chat.chat_type === 'group' ? <Users className="h-4 w-4" /> : getInitials(chat.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex justify-between items-baseline">
              <span className="font-medium truncate">{chat.name}</span>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                {formatRelative(chat.last_message_time)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground truncate">
                {chat.last_message || 'Sin mensajes'}
              </span>
              {chat.unread_count > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-2">
                  {chat.unread_count > 99 ? '99+' : chat.unread_count}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============ MESSAGE BUBBLE COMPONENT ============

function MessageBubble({
  message,
  isOwn,
  showSender,
}: {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {showSender && !isOwn && (
          <div className="text-xs text-muted-foreground mb-1 px-3">
            {message.sender?.full_name || 'Usuario'}
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card border border-border rounded-bl-sm'
          }`}
        >
          {message.type_message === 'image' && message.file_path && (
            <img
              src={message.file_path}
              alt="Imagen"
              className="max-w-full rounded mb-2 cursor-pointer"
              onClick={() => window.open(message.file_path!, '_blank')}
            />
          )}
          {message.type_message === 'file' && message.file_path && (
            <a
              href={message.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm underline mb-2"
            >
              <Paperclip className="h-4 w-4" />
              {message.file_name || 'Archivo'}
            </a>
          )}
          {message.message && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
          )}
          <div className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TYPING INDICATOR COMPONENT ============

function TypingIndicator({ users }: { users: TypingUser[] }) {
  if (users.length === 0) return null;
  const names = users.map(u => u.user_name).slice(0, 2).join(', ');
  const text = users.length === 1 ? `${names} esta escribiendo` : `${names} estan escribiendo`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '-0.3s' }} />
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '-0.15s' }} />
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
      </div>
      <span className="italic">{text}...</span>
    </div>
  );
}

// ============ CHAT WINDOW COMPONENT ============

function ChatWindow({
  chat,
  messages,
  typingUsers,
  onBack,
  onSendMessage,
  onLoadMore,
  isConnected,
}: {
  chat: Chat;
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onLoadMore: () => void;
  isConnected: boolean;
}) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { userInfo } = userInfoStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    onSendMessage(text.trim());
    setText('');
    setIsLoading(false);
  };

  const handleScroll = () => {
    if (containerRef.current && containerRef.current.scrollTop < 50) {
      onLoadMore();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border bg-card flex items-center gap-3 shrink-0">
        <Button size="icon" variant="ghost" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={chat.photo || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(chat.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{chat.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {isConnected ? (
              <><Wifi className="h-3 w-3 text-green-500" /> Conectado</>
            ) : (
              <><WifiOff className="h-3 w-3" /> Desconectado</>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-background"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No hay mensajes. Envia el primero.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender_id === userInfo?.id;
            const prev = messages[idx - 1];
            const showSender = !prev || prev.sender_id !== msg.sender_id;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isOwn}
                showSender={showSender}
              />
            );
          })
        )}
        <TypingIndicator users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card flex gap-2 shrink-0">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Escribe un mensaje..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={!text.trim() || isLoading} size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// ============ NEW CHAT MODAL COMPONENT ============

function NewChatModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (chatId: number) => void;
}) {
  const [users, setUsers] = useState<PubUser[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchAvailableUsers, createChat, fetchChats } = useChat();

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchAvailableUsers().then(u => {
        setUsers(u);
        setLoading(false);
      });
      setSelected(null);
      setSearch('');
    }
  }, [open, fetchAvailableUsers]);

  const filtered = users.filter(
    u =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!selected) return;
    setLoading(true);
    const chatId = await createChat([selected], 'direct');
    if (chatId) {
      await fetchChats();
      onCreated(chatId);
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Conversacion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuario..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay usuarios</div>
            ) : (
              filtered.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelected(user.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent ${
                    selected === user.id ? 'bg-primary/10 ring-2 ring-primary' : ''
                  }`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photo || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left min-w-0">
                    <div className="font-medium text-sm truncate">{user.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!selected || loading}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ MAIN CHAT PAGE ============

export default function ChatPage() {
  const [hydrated, setHydrated] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);

  const {
    chats,
    messages,
    currentChatId,
    typingUsers,
    isConnected,
    isLoading,
    setCurrentChat,
  } = useChatStore();

  const { fetchChats, fetchMessages, sendMessage, markAsRead } = useChat();
  const { sendMessage: wsSendMessage, joinChat, reconnect } = useWebSocket();

  // Hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch chats on mount
  useEffect(() => {
    if (hydrated) {
      fetchChats();
    }
  }, [hydrated, fetchChats]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
      markAsRead(currentChatId);
      joinChat(currentChatId);
      setShowMobileList(false);
    }
  }, [currentChatId, fetchMessages, markAsRead, joinChat]);

  const handleSelectChat = (id: number) => {
    setCurrentChat(id);
  };

  const handleBack = () => {
    setCurrentChat(null);
    setShowMobileList(true);
  };

  const handleSendMessage = (text: string) => {
    if (!currentChatId) return;
    // Try WebSocket first, fallback to HTTP
    const sent = wsSendMessage(currentChatId, text);
    if (!sent) {
      sendMessage(currentChatId, text).then(() => {
        fetchMessages(currentChatId);
      });
    }
  };

  const handleLoadMore = () => {
    if (currentChatId) {
      const currentMessages = messages[currentChatId] || [];
      fetchMessages(currentChatId, currentMessages.length);
    }
  };

  const handleRefresh = () => {
    fetchChats();
    reconnect();
  };

  const handleChatCreated = (chatId: number) => {
    setCurrentChat(chatId);
  };

  const currentChat = chats.find(c => c.id === currentChatId);
  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];
  const currentTyping = currentChatId ? typingUsers[currentChatId] || [] : [];

  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div
        className={`${
          showMobileList ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-80 lg:w-96 border-r border-border bg-card`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold">Mensajes</h1>
          <div className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              isConnected ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
            }`}>
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            </div>
            <Button size="icon" variant="ghost" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setShowNewChat(true)}>
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat List */}
        {isLoading && chats.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary border-r-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ChatList chats={chats} currentChatId={currentChatId} onSelect={handleSelectChat} />
        )}
      </div>

      {/* Main Area */}
      <div className={`${!showMobileList || !currentChatId ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
        {currentChat ? (
          <ChatWindow
            chat={currentChat}
            messages={currentMessages}
            typingUsers={currentTyping}
            onBack={handleBack}
            onSendMessage={handleSendMessage}
            onLoadMore={handleLoadMore}
            isConnected={isConnected}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center p-8">
              <MessageSquarePlus className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-lg font-medium mb-2">Bienvenido al Chat</h2>
              <p className="text-muted-foreground mb-4">
                Selecciona una conversacion o crea una nueva
              </p>
              <Button onClick={() => setShowNewChat(true)}>
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Nueva Conversacion
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreated={handleChatCreated}
      />
    </div>
  );
}
