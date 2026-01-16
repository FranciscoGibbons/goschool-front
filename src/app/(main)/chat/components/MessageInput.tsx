'use client';

import { useState, useRef, useCallback } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useChat } from '@/hooks/useChat';
import type { WSClientMessage } from '@/types/chat';

interface MessageInputProps {
  chatId: number;
}

export default function MessageInput({ chatId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { sendMessage: sendWS, isConnected } = useWebSocket();
  const { sendMessageHTTP, uploadFile } = useChat();

  // Auto-resize textarea
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    setMessage(textarea.value);

    // Send typing indicator
    if (!isTyping && textarea.value.length > 0) {
      setIsTyping(true);
      const typingMsg: WSClientMessage = {
        type: 'TypingStart',
        chat_id: chatId,
      };
      sendWS(typingMsg);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const stopTypingMsg: WSClientMessage = {
        type: 'TypingStop',
        chat_id: chatId,
      };
      sendWS(stopTypingMsg);
    }, 2000);
  }, [chatId, isTyping, sendWS]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      const stopTypingMsg: WSClientMessage = {
        type: 'TypingStop',
        chat_id: chatId,
      };
      sendWS(stopTypingMsg);
    }

    try {
      // Upload file if selected
      if (selectedFile) {
        await uploadFile(chatId, selectedFile);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      // Send text message
      if (message.trim()) {
        if (isConnected) {
          // Send via WebSocket for real-time delivery
          const wsMsg: WSClientMessage = {
            type: 'SendMessage',
            chat_id: chatId,
            message: message.trim(),
          };
          const sent = sendWS(wsMsg);

          if (!sent) {
            // Fallback to HTTP if WebSocket fails
            await sendMessageHTTP(chatId, {
              chat_id: chatId,
              message: message.trim(),
            });
          }
        } else {
          // Use HTTP if not connected
          await sendMessageHTTP(chatId, {
            chat_id: chatId,
            message: message.trim(),
          });
        }

        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-accent rounded-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip,.txt"
        />

        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="resize-none min-h-[44px] max-h-[120px] pr-12 rounded-2xl"
            rows={1}
          />
        </div>

        <Button
          size="icon"
          className={`h-10 w-10 flex-shrink-0 rounded-full transition-all duration-200 ${
            message.trim() || selectedFile
              ? 'scale-100 opacity-100'
              : 'scale-90 opacity-50'
          }`}
          onClick={handleSend}
          disabled={!message.trim() && !selectedFile}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
