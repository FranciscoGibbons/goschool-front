'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, File } from 'lucide-react';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';
import userInfoStore from '@/store/userInfoStore';

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar: boolean;
}

export default function MessageBubble({ message, showAvatar }: MessageBubbleProps) {
  const { userInfo } = userInfoStore();
  const isOwn = message.sender_id === userInfo?.id;

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: es });
    } catch {
      return '';
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

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        'flex gap-2 items-end animate-in fade-in slide-in-from-bottom-4 duration-300',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.photo || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {message.sender?.full_name ? getInitials(message.sender.full_name) : '?'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Empty space for alignment */}
      {!showAvatar && !isOwn && <div className="w-8 flex-shrink-0" />}

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[70%] space-y-1',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender Name (only for others' messages) */}
        {showAvatar && !isOwn && (
          <p className="text-xs text-muted-foreground px-3">
            {message.sender?.full_name || 'Unknown'}
          </p>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 shadow-sm',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card text-card-foreground rounded-bl-sm border border-border'
          )}
        >
          {/* File/Image Message */}
          {message.type_message === 'file' && message.file_path && (
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                'p-2 rounded-lg',
                isOwn ? 'bg-primary-foreground/10' : 'bg-accent'
              )}>
                <File className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {message.file_name || 'File'}
                </p>
                {message.file_size && (
                  <p className={cn(
                    'text-xs',
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {(message.file_size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => handleDownload(message.file_path!, message.file_name || 'file')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}

          {message.type_message === 'image' && message.file_path && (
            <div className="mb-2 rounded-lg overflow-hidden">
              <Image
                src={message.file_path}
                alt={message.file_name || 'Image'}
                width={640}
                height={360}
                className="max-w-full h-auto max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.file_path!, '_blank')}
              />
            </div>

          )}

          {/* Text Message */}
          {message.message && (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.message}
            </p>
          )}

          {/* Timestamp */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <p className={cn(
              'text-xs',
              isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}>
              {formatTime(message.created_at)}
            </p>
            {isOwn && (
              <span className="text-xs">✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
