'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  X,
  FileIcon,
  Loader2,
  Check,
  CheckCheck,
  Pencil,
  Trash2,
  MoreVertical,
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
import { SecuritySanitizer } from '@/lib/security';
import type { Chat, ChatMessage, PubUser, TypingUser } from '@/types/chat';

// ============ HELPER FUNCTIONS ============

/** Convert a backend upload URL to the frontend image-proxy path.
 *  e.g. "https://127.0.0.1/./uploads/chat_files/uuid.jpg" → "/api/image-proxy/uploads/chat_files/uuid.jpg"
 *  Falls back to original URL if pattern doesn't match. */
function toImageProxy(url: string): string {
  // Extract the "uploads/..." portion from the URL
  const match = url.match(/uploads\/chat_files\/[^?#]+/);
  if (match) return `/api/image-proxy/${match[0]}`;
  return url;
}

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
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chat.photo || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {chat.chat_type === 'group' ? <Users className="h-4 w-4" /> : getInitials(chat.name)}
              </AvatarFallback>
            </Avatar>
            {chat.chat_type === 'direct' && chat.is_online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
            )}
          </div>
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
  onEdit,
  onDelete,
}: {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuAbove, setMenuAbove] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const toggleMenu = () => {
    if (!showMenu && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // If there's less than 100px above the button, open downward
      setMenuAbove(rect.top > 100);
    }
    setShowMenu(!showMenu);
  };

  const isEdited = !message.is_deleted && message.updated_at !== message.created_at;

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-[75%] min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>
          {showSender && !isOwn && (
            <div className="text-xs text-muted-foreground mb-1 px-3">
              {message.sender?.full_name || 'Usuario'}
            </div>
          )}
          <div className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-primary/40 rounded-br-sm'
              : 'bg-card/60 border border-border rounded-bl-sm'
          }`}>
            <p className="text-sm italic text-muted-foreground">Mensaje eliminado</p>
            <div className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/50 text-right' : 'text-muted-foreground'}`}>
              {formatTime(message.created_at)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div className={`max-w-[75%] min-w-0 relative ${isOwn ? 'items-end' : 'items-start'}`}>
        {showSender && !isOwn && (
          <div className="text-xs text-muted-foreground mb-1 px-3">
            {message.sender?.full_name || 'Usuario'}
          </div>
        )}
        <div className="relative">
          {/* Context menu button for own messages */}
          {isOwn && (
            <div className={`absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
              <button
                ref={btnRef}
                onClick={toggleMenu}
                className="p-1 rounded-full hover:bg-accent text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Dropdown menu */}
          {showMenu && isOwn && (
            <div
              ref={menuRef}
              className={`absolute ${isOwn ? 'right-0' : 'left-0'} ${menuAbove ? '-top-2 -translate-y-full' : 'bottom-0 translate-y-full'} z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[140px]`}
            >
              {message.type_message === 'text' && onEdit && (
                <button
                  onClick={() => { onEdit(message); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent text-left"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { onDelete(message); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent text-destructive text-left"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              )}
            </div>
          )}

          <div
            className={`px-4 py-2 rounded-2xl overflow-hidden ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-card border border-border rounded-bl-sm'
            }`}
          >
            {message.type_message === 'image' && message.file_path && (() => {
              const proxiedUrl = toImageProxy(message.file_path);
              return (
                <img
                  src={proxiedUrl}
                  alt={message.file_name || 'Imagen'}
                  className="w-48 h-48 object-cover rounded mb-2 cursor-pointer"
                  onClick={() => window.open(proxiedUrl, '_blank')}
                />
              );
            })()}
            {message.type_message === 'file' && message.file_path && (() => {
              const safeUrl = SecuritySanitizer.sanitizeUrl(message.file_path);
              return safeUrl !== '/' ? (
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm underline mb-2"
                >
                  <Paperclip className="h-4 w-4" />
                  {message.file_name || 'Archivo'}
                </a>
              ) : null;
            })()}
            {message.type_message === 'text' && message.message && (
              <p className="text-sm whitespace-pre-wrap break-all">{message.message}</p>
            )}
            <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'}`}>
              {isEdited && <span className="italic">editado</span>}
              {formatTime(message.created_at)}
              {isOwn && (
                message.is_read
                  ? <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
                  : <Check className="h-3.5 w-3.5" />
              )}
            </div>
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,image/gif,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function ChatWindow({
  chat,
  messages,
  typingUsers,
  onBack,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onUploadFile,
  onLoadMore,
  onTypingStart,
  onTypingStop,
  isConnected,
}: {
  chat: Chat;
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onEditMessage: (messageId: number, newMessage: string) => void;
  onDeleteMessage: (messageId: number) => void;
  onUploadFile: (file: File) => Promise<void>;
  onLoadMore: () => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  isConnected: boolean;
}) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{ id: number; text: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const { userInfo } = userInfoStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);


  // Clean up typing timer on unmount or chat change
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (isTypingRef.current) {
        onTypingStop();
        isTypingRef.current = false;
      }
    };
  }, [onTypingStop]);

  const handleTextChange = (value: string) => {
    setText(value);

    if (value.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart();
      }
      // Reset the stop timer on every keystroke
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTypingStop();
      }, 2000);
    } else {
      // Input cleared
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop();
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      }
    }
  };

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    // Stop typing indicator on send
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }
    setIsLoading(true);
    if (editingMessage) {
      onEditMessage(editingMessage.id, text.trim());
      setEditingMessage(null);
    } else {
      onSendMessage(text.trim());
    }
    setText('');
    setIsLoading(false);
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessage({ id: message.id, text: message.message });
    setText(message.message);
    inputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setText('');
  };

  const handleDelete = (message: ChatMessage) => {
    if (confirm('¿Eliminar este mensaje?')) {
      onDeleteMessage(message.id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert('El archivo es muy grande. Maximo 10MB.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    try {
      await onUploadFile(selectedFile);
    } finally {
      setIsUploading(false);
      clearSelectedFile();
    }
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
            {chat.chat_type === 'direct' ? (
              chat.is_online ? (
                <><span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> En linea</>
              ) : chat.last_seen_at ? (
                <>Ultima vez {formatRelative(chat.last_seen_at)}</>
              ) : (
                <>Desconectado</>
              )
            ) : (
              <><Users className="h-3 w-3" /> Grupo</>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-background"
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
                onEdit={handleStartEdit}
                onDelete={handleDelete}
              />
            );
          })
        )}
        <TypingIndicator users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview Bar */}
      {selectedFile && (
        <div className="px-3 py-2 border-t border-border bg-card flex items-center gap-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-16 w-16 object-cover rounded border border-border"
            />
          ) : (
            <div className="h-16 w-16 flex items-center justify-center rounded border border-border bg-muted">
              <FileIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={clearSelectedFile}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      {/* Editing indicator */}
      {editingMessage && (
        <div className="px-3 py-2 border-t border-border bg-accent/50 flex items-center gap-2">
          <Pencil className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground truncate flex-1">Editando mensaje</span>
          <button onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border bg-card flex gap-2 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileSelect}
          className="hidden"
        />
        {!editingMessage && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Adjuntar archivo (JPG, PNG, GIF, PDF, DOCX - max. 10MB)"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        )}
        <Input
          ref={inputRef}
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) handleSend();
            if (e.key === 'Escape' && editingMessage) handleCancelEdit();
          }}
          placeholder={editingMessage ? "Editar mensaje..." : "Escribe un mensaje..."}
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
  const [selected, setSelected] = useState<number[]>([]);
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchAvailableUsers, createChat, fetchChats } = useChat();

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchAvailableUsers().then(u => {
        setUsers(u);
        setLoading(false);
      });
      setSelected([]);
      setSearch('');
      setChatType('direct');
      setGroupName('');
    }
  }, [open, fetchAvailableUsers]);

  const filtered = users.filter(
    u =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (userId: number) => {
    if (chatType === 'direct') {
      setSelected([userId]);
    } else {
      setSelected(prev =>
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
    }
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;
    if (chatType === 'group' && !groupName.trim()) return;
    setLoading(true);
    const chatId = await createChat(
      selected,
      chatType,
      chatType === 'group' ? groupName.trim() : undefined
    );
    if (chatId) {
      await fetchChats();
      onCreated(chatId);
      onClose();
    }
    setLoading(false);
  };

  const canCreate = chatType === 'direct'
    ? selected.length === 1
    : selected.length >= 1 && groupName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Conversacion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={chatType === 'direct' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setChatType('direct');
                if (selected.length > 1) setSelected([]);
              }}
              className="flex-1"
            >
              Chat directo
            </Button>
            <Button
              variant={chatType === 'group' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChatType('group')}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Grupo
            </Button>
          </div>

          {chatType === 'group' && (
            <Input
              placeholder="Nombre del grupo..."
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuario..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {chatType === 'group' && selected.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selected.map(id => {
                const user = users.find(u => u.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                  >
                    {user?.full_name || 'Usuario'}
                    <button
                      onClick={() => setSelected(prev => prev.filter(x => x !== id))}
                      className="hover:text-primary/70"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay usuarios</div>
            ) : (
              filtered.map(user => (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent ${
                    selected.includes(user.id) ? 'bg-primary/10 ring-2 ring-primary' : ''
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
                  {chatType === 'group' && selected.includes(user.id) && (
                    <span className="ml-auto text-primary text-sm">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!canCreate || loading}>
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

  const { fetchChats, fetchMessages, sendMessage, editMessage: httpEditMessage, deleteMessage: httpDeleteMessage, uploadFile, markAsRead } = useChat();
  const { sendMessage: wsSendMessage, editMessage: wsEditMessage, deleteMessage: wsDeleteMessage, joinChat, reconnect, startTyping, stopTyping } = useWebSocket();

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

  const handleEditMessage = useCallback((messageId: number, newMessage: string) => {
    if (!currentChatId) return;
    const sent = wsEditMessage(messageId, newMessage);
    if (!sent) {
      httpEditMessage(currentChatId, messageId, newMessage).then(() => {
        fetchMessages(currentChatId);
      });
    }
  }, [currentChatId, wsEditMessage, httpEditMessage, fetchMessages]);

  const handleDeleteMessage = useCallback((messageId: number) => {
    if (!currentChatId) return;
    const sent = wsDeleteMessage(messageId);
    if (!sent) {
      httpDeleteMessage(currentChatId, messageId).then(() => {
        fetchMessages(currentChatId);
      });
    }
  }, [currentChatId, wsDeleteMessage, httpDeleteMessage, fetchMessages]);

  const handleTypingStart = useCallback(() => {
    if (currentChatId) startTyping(currentChatId);
  }, [currentChatId, startTyping]);

  const handleTypingStop = useCallback(() => {
    if (currentChatId) stopTyping(currentChatId);
  }, [currentChatId, stopTyping]);

  const handleUploadFile = useCallback(async (file: File) => {
    if (!currentChatId) return;
    const success = await uploadFile(currentChatId, file);
    if (success && !isConnected) {
      // WebSocket will handle adding the message if connected
      // Fallback: re-fetch messages if WS is down
      fetchMessages(currentChatId);
    }
  }, [currentChatId, uploadFile, isConnected, fetchMessages]);

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
      <div className="fixed inset-0 top-14 bottom-20 lg:top-0 lg:bottom-0 lg:left-64 flex items-center justify-center z-10 bg-background">
        <div className="h-8 w-8 border-4 border-primary border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-14 bottom-20 lg:top-0 lg:bottom-0 lg:left-64 flex bg-background z-10">
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
              isConnected ? 'bg-status-online-muted text-status-online' : 'bg-status-offline-muted text-status-offline'
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
      <div className={`${!showMobileList || !currentChatId ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 flex-col`}>
        {currentChat ? (
          <ChatWindow
            chat={currentChat}
            messages={currentMessages}
            typingUsers={currentTyping}
            onBack={handleBack}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onUploadFile={handleUploadFile}
            onLoadMore={handleLoadMore}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
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
