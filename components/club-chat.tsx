'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, Users, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  subscribeToClubMessages, 
  sendMessage, 
  ChatMessage, 
  isClubMember 
} from '@/lib/chat-service';
import { format } from 'date-fns';

interface ClubChatProps {
  clubId: string;
  clubName?: string;
}

export function ClubChat({ clubId, clubName = 'Club Chat' }: ClubChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setError('You are currently offline. Messages will be sent when connection is restored.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if user has access to this club's chat
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const isMember = await isClubMember(clubId, user.uid);
        setHasAccess(isMember);
        setRetryCount(0);
      } catch (error) {
        console.error('Error checking club membership:', error);
        setError('Failed to verify club membership. Please try again.');
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, clubId]);

  // Subscribe to messages when user has access
  useEffect(() => {
    if (!hasAccess || !user) return;

    let retryTimeout: NodeJS.Timeout;

    const handleMessages = (newMessages: ChatMessage[]) => {
      setMessages(newMessages);
      setIsLoading(false);
      setError(null);
      setRetryCount(0);
    };

    const handleError = (error: any) => {
      console.error('Error subscribing to messages:', error);
      setError('Failed to load messages. Retrying...');

      // Retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      retryTimeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, delay);
    };

    try {
      const unsubscribe = subscribeToClubMessages(clubId, handleMessages);
      return () => {
        unsubscribe();
        if (retryTimeout) clearTimeout(retryTimeout);
      };
    } catch (error) {
      handleError(error);
    }
  }, [clubId, hasAccess, user, retryCount]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || isSending || !isOnline) return;

    const messageText = newMessage.trim();
    setIsSending(true);
    setError(null);

    try {
      await sendMessage(clubId, {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role
      }, messageText);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');

      // Restore the message text so user can retry
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to access the chat</p>
        </div>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">You don't have access to this club's chat</p>
          <p className="text-sm text-muted-foreground mt-1">Only club members can participate</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          {clubName}
          <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{messages.length > 0 ? `${new Set(messages.map(m => m.senderId)).size} active` : '0 active'}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Error Alert */}
        {error && (
          <div className="px-4 pt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="px-4 pt-2">
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You're offline. Messages will be sent when connection is restored.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium mb-1">No messages yet</p>
                <p className="text-sm">Start the conversation and connect with your club members!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.senderId === user.uid;
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                const isLastFromSender = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                      {showAvatar ? (
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                          <AvatarFallback className={`text-xs font-medium ${
                            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {getInitials(message.senderName)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      {showAvatar && !isCurrentUser && (
                        <p className="text-xs font-medium text-muted-foreground mb-1 px-1">
                          {message.senderName}
                        </p>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        } ${!isLastFromSender ? 'mb-1' : 'mb-2'}`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                      </div>

                      {isLastFromSender && (
                        <p className={`text-xs text-muted-foreground px-1 ${
                          isCurrentUser ? 'text-right' : 'text-left'
                        }`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t bg-muted/20 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isOnline ? "Type your message..." : "Offline - messages will be sent when connected"}
                disabled={isSending || !isOnline}
                className="pr-12 rounded-full border-2 focus:border-primary/50 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              {newMessage.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending || !isOnline}
              size="sm"
              className="rounded-full h-10 w-10 p-0 shadow-md hover:shadow-lg transition-shadow"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              ) : isOnline ? (
                <Send className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 px-1">
            <span>Press Enter to send • Shift+Enter for new line</span>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
