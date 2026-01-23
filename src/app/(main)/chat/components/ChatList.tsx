'use client';

import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/sacred';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ChatList() {
  const { chats, currentChatId, setCurrentChat, onlineUsers } = useChatStore();

  // Ensure onlineUsers is usable (might be corrupted from localStorage)
  const safeOnlineUsers = onlineUsers instanceof Set ? onlineUsers : new Set<number>();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return '';
    }
  };

  // Ensure chats is an array
  const safeChats = Array.isArray(chats) ? chats : [];

  if (safeChats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-text-secondary">
          <p className="text-sm">No hay conversaciones</p>
          <p className="text-xs mt-1">Crea una nueva para empezar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {safeChats.map((chat) => {
        const isActive = chat.id === currentChatId;
        const isOnline = chat.chat_type === 'direct' && chat.participants?.some(
          (p) => safeOnlineUsers.has(p.user_id)
        );

        return (
          <button
            key={chat.id}
            onClick={() => setCurrentChat(chat.id)}
            className={cn(
              'w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-all duration-200 border-l-4',
              isActive
                ? 'bg-accent border-primary'
                : 'border-transparent hover:border-accent'
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.photo || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(chat.name)}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-surface" />
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3 className={cn(
                  'font-semibold truncate',
                  isActive && 'text-primary'
                )}>
                  {chat.name}
                </h3>
                {chat.last_message_time && (
                  <span className="text-xs text-text-secondary flex-shrink-0">
                    {formatTime(chat.last_message_time)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-text-secondary truncate flex-1">
                  {chat.last_message || 'No messages yet'}
                </p>
                {(chat.unread_count || 0) > 0 && (
                  <Badge variant="info">
                    {(chat.unread_count || 0) > 99 ? '99+' : chat.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
