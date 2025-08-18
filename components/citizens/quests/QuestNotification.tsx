import React from 'react';
import { Quest } from '../../../interfaces/quest.interface';

interface QuestNotificationProps {
  quest: Quest;
  type: 'accepted' | 'completed' | 'progress' | 'available';
  onDismiss: () => void;
  className?: string;
}

export default function QuestNotification({ 
  quest, 
  type, 
  onDismiss, 
  className = '' 
}: QuestNotificationProps) {
  const getNotificationConfig = () => {
    switch (type) {
      case 'accepted':
        return {
          icon: '📋',
          title: 'Quest Accepted!',
          message: `You've started "${quest.title}"`,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconBg: 'bg-blue-100'
        };
      case 'completed':
        return {
          icon: '🎉',
          title: 'Quest Completed!',
          message: `"${quest.title}" is complete! Claim your rewards.`,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconBg: 'bg-green-100'
        };
      case 'progress':
        return {
          icon: '⚡',
          title: 'Quest Progress!',
          message: `Progress made on "${quest.title}" (${quest.progress}/${quest.maxProgress})`,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconBg: 'bg-yellow-100'
        };
      case 'available':
        return {
          icon: '✨',
          title: 'New Quest Available!',
          message: `"${quest.title}" is now available to accept`,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          iconBg: 'bg-purple-100'
        };
      default:
        return {
          icon: '📋',
          title: 'Quest Update',
          message: quest.title,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconBg: 'bg-gray-100'
        };
    }
  };

  const config = getNotificationConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.iconBg} rounded-full p-2 flex-shrink-0`}>
          <span className="text-lg" role="img">
            {config.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h4 className={`font-semibold ${config.textColor} text-sm`}>
                {config.title}
              </h4>
              <p className={`${config.textColor} text-sm opacity-90 mt-1`}>
                {config.message}
              </p>

              {/* Additional info for specific types */}
              {type === 'completed' && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className={`${config.textColor} text-xs`}>
                    +{quest.xpReward} XP earned
                  </span>
                </div>
              )}

              {type === 'progress' && quest.maxProgress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={onDismiss}
              className={`${config.textColor} opacity-50 hover:opacity-75 transition-opacity ml-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
