'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  showZero?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

export function NotificationBadge({
  count,
  maxCount = 99,
  showZero = false,
  size = 'sm',
  variant = 'destructive',
  className,
  children
}: NotificationBadgeProps) {
  const shouldShow = count > 0 || showZero;
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const sizeClasses = {
    sm: 'h-4 w-4 text-xs min-w-[16px]',
    md: 'h-5 w-5 text-xs min-w-[20px]',
    lg: 'h-6 w-6 text-sm min-w-[24px]'
  };

  if (!shouldShow && !children) return null;

  if (children) {
    return (
      <div className="relative inline-block">
        {children}
        {shouldShow && (
          <Badge
            variant={variant}
            className={cn(
              'absolute -top-1 -right-1 flex items-center justify-center rounded-full border-2 border-background',
              sizeClasses[size],
              className
            )}
          >
            {displayCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        'flex items-center justify-center rounded-full',
        sizeClasses[size],
        className
      )}
    >
      {displayCount}
    </Badge>
  );
}

// Pulse animation for new notifications
export function PulsingNotificationBadge({
  count,
  maxCount = 99,
  showZero = false,
  size = 'sm',
  className,
  children
}: NotificationBadgeProps) {
  const shouldShow = count > 0 || showZero;

  if (!shouldShow && !children) return null;

  return (
    <div className="relative inline-block">
      {children}
      {shouldShow && (
        <div className="absolute -top-1 -right-1">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
          {/* Badge */}
          <NotificationBadge
            count={count}
            maxCount={maxCount}
            showZero={showZero}
            size={size}
            variant="destructive"
            className={cn('relative', className)}
          />
        </div>
      )}
    </div>
  );
}

// Dot indicator for simple notifications
export function NotificationDot({
  show = false,
  size = 'sm',
  color = 'bg-red-500',
  className,
  children
}: {
  show?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  if (!show && !children) return null;

  if (children) {
    return (
      <div className="relative inline-block">
        {children}
        {show && (
          <div
            className={cn(
              'absolute -top-0.5 -right-0.5 rounded-full border-2 border-background',
              sizeClasses[size],
              color,
              className
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full',
        sizeClasses[size],
        color,
        className
      )}
    />
  );
}
