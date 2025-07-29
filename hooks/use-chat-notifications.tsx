'use client';

import { useState, useEffect, useCallback } from 'react';
import { subscribeToClubMessages, ChatMessage } from '@/lib/chat-service';
import { useAuth } from '@/hooks/useAuth';

interface ChatNotification {
  clubId: string;
  clubName: string;
  unreadCount: number;
  lastMessage?: ChatMessage;
  lastReadTimestamp?: Date;
}

interface UseChatNotificationsReturn {
  notifications: ChatNotification[];
  totalUnreadCount: number;
  markAsRead: (clubId: string) => void;
  clearAllNotifications: () => void;
  getUnreadCount: (clubId: string) => number;
}

export function useChatNotifications(clubIds: string[] = []): UseChatNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, Date>>({});

  // Load last read timestamps from localStorage
  useEffect(() => {
    if (!user) return;

    const stored = localStorage.getItem(`chat_read_timestamps_${user.uid}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const timestamps: Record<string, Date> = {};
        Object.entries(parsed).forEach(([clubId, timestamp]) => {
          timestamps[clubId] = new Date(timestamp as string);
        });
        setLastReadTimestamps(timestamps);
      } catch (error) {
        console.error('Error loading read timestamps:', error);
      }
    }
  }, [user]);

  // Save last read timestamps to localStorage
  const saveReadTimestamps = useCallback((timestamps: Record<string, Date>) => {
    if (!user) return;

    const toSave: Record<string, string> = {};
    Object.entries(timestamps).forEach(([clubId, timestamp]) => {
      toSave[clubId] = timestamp.toISOString();
    });
    
    localStorage.setItem(`chat_read_timestamps_${user.uid}`, JSON.stringify(toSave));
  }, [user]);

  // Subscribe to messages for all clubs
  useEffect(() => {
    if (!user || clubIds.length === 0) {
      setNotifications([]);
      return;
    }

    const unsubscribeFunctions: (() => void)[] = [];

    clubIds.forEach(clubId => {
      const unsubscribe = subscribeToClubMessages(clubId, (messages) => {
        const lastReadTime = lastReadTimestamps[clubId] || new Date(0);
        const unreadMessages = messages.filter(msg => {
          const messageTime = msg.timestamp?.toDate() || new Date(0);
          return messageTime > lastReadTime && msg.senderId !== user.uid;
        });

        const lastMessage = messages[messages.length - 1];

        setNotifications(prev => {
          const existing = prev.find(n => n.clubId === clubId);
          const newNotification: ChatNotification = {
            clubId,
            clubName: `Club ${clubId}`, // TODO: Get actual club name
            unreadCount: unreadMessages.length,
            lastMessage,
            lastReadTimestamp: lastReadTime
          };

          if (existing) {
            return prev.map(n => n.clubId === clubId ? newNotification : n);
          } else {
            return [...prev, newNotification];
          }
        });
      });

      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [user, clubIds, lastReadTimestamps]);

  const markAsRead = useCallback((clubId: string) => {
    const now = new Date();
    const newTimestamps = { ...lastReadTimestamps, [clubId]: now };
    setLastReadTimestamps(newTimestamps);
    saveReadTimestamps(newTimestamps);

    // Update notifications
    setNotifications(prev =>
      prev.map(n =>
        n.clubId === clubId
          ? { ...n, unreadCount: 0, lastReadTimestamp: now }
          : n
      )
    );
  }, [lastReadTimestamps, saveReadTimestamps]);

  const clearAllNotifications = useCallback(() => {
    const now = new Date();
    const newTimestamps: Record<string, Date> = {};
    
    notifications.forEach(n => {
      newTimestamps[n.clubId] = now;
    });

    setLastReadTimestamps(prev => ({ ...prev, ...newTimestamps }));
    saveReadTimestamps({ ...lastReadTimestamps, ...newTimestamps });

    setNotifications(prev =>
      prev.map(n => ({ ...n, unreadCount: 0, lastReadTimestamp: now }))
    );
  }, [notifications, lastReadTimestamps, saveReadTimestamps]);

  const getUnreadCount = useCallback((clubId: string): number => {
    const notification = notifications.find(n => n.clubId === clubId);
    return notification?.unreadCount || 0;
  }, [notifications]);

  const totalUnreadCount = notifications.reduce((total, n) => total + n.unreadCount, 0);

  return {
    notifications,
    totalUnreadCount,
    markAsRead,
    clearAllNotifications,
    getUnreadCount
  };
}

// Hook for a single club's notifications
export function useClubChatNotifications(clubId: string) {
  const { notifications, markAsRead, getUnreadCount } = useChatNotifications([clubId]);
  
  const clubNotification = notifications.find(n => n.clubId === clubId);
  
  return {
    unreadCount: clubNotification?.unreadCount || 0,
    lastMessage: clubNotification?.lastMessage,
    markAsRead: () => markAsRead(clubId),
    hasUnread: (clubNotification?.unreadCount || 0) > 0
  };
}
