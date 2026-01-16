'use client';

import type { TypingUser } from '@/types/chat';

interface TypingIndicatorProps {
  users: TypingUser[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names = users.map((u) => u.user_name).join(', ');
  const text = users.length === 1 ? `${names} is typing` : `${names} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
      </div>
      <p className="text-sm text-muted-foreground italic">{text}...</p>
    </div>
  );
}
