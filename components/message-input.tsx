'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 1000,
  className
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (but not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Enforce max length
    if (value.length <= maxLength) {
      setMessage(value);
    }

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const isMessageValid = message.trim().length > 0;
  const isDisabled = disabled || isSending || !isMessageValid;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[40px] max-h-[120px] resize-none pr-12"
            rows={1}
          />
          
          {/* Character count */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {message.length}/{maxLength}
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isDisabled}
          size="sm"
          className="h-10 w-10 p-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      {/* Helper text */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {message.length > 0 && (
          <span className={cn(
            message.length > maxLength * 0.9 ? "text-destructive" : ""
          )}>
            {message.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
