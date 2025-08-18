import React, { useState, useEffect } from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import QuestNotification from './QuestNotification';

interface QuestNotificationManagerProps {
  className?: string;
}

interface NotificationItem {
  id: string;
  quest: Quest;
  type: 'accepted' | 'completed' | 'progress' | 'available';
  timestamp: number;
}

export default function QuestNotificationManager({ className = '' }: QuestNotificationManagerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notification => now - notification.timestamp < 5000)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to add new notification
  const addNotification = (quest: Quest, type: NotificationItem['type']) => {
    const notification: NotificationItem = {
      id: `${quest.id}-${type}-${Date.now()}`,
      quest,
      type,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Global event listener for quest notifications
  useEffect(() => {
    const handleQuestEvent = (event: CustomEvent) => {
      const { quest, type } = event.detail;
      addNotification(quest, type);
    };

    window.addEventListener('questNotification', handleQuestEvent as EventListener);
    
    return () => {
      window.removeEventListener('questNotification', handleQuestEvent as EventListener);
    };
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-3 w-80 ${className}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out animate-slide-in-right"
        >
          <QuestNotification
            quest={notification.quest}
            type={notification.type}
            onDismiss={() => dismissNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Utility function to trigger quest notifications
export const triggerQuestNotification = (quest: Quest, type: 'accepted' | 'completed' | 'progress' | 'available') => {
  const event = new CustomEvent('questNotification', {
    detail: { quest, type }
  });
  window.dispatchEvent(event);
};
