import React from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import { formatDistanceToNow } from 'date-fns';
import AGButton from '../../../ui/common/ag-button.component';
import AGText from '../../../ui/common/ag-text.component';

interface QuestCardProps {
  quest: Quest;
  onAccept?: (questId: string) => void;
  onView?: (quest: Quest) => void;
  className?: string;
}

export default function QuestCard({ quest, onAccept, onView, className = '' }: QuestCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'hard': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'legendary': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'in_progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'locked': return 'text-white/40 bg-white/10 border-white/20';
      case 'expired': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getProgressPercentage = () => {
    return quest.maxProgress > 0 ? (quest.progress / quest.maxProgress) * 100 : 0;
  };

  const isExpiringSoon = () => {
    if (!quest.expiresAt) return false;
    const now = new Date();
    const expiryTime = new Date(quest.expiresAt);
    const hoursUntilExpiry = (expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

  return (
    <div 
      onClick={() => onView && onView(quest)}
      className={`
        relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300
        ${quest.status !== 'locked' 
          ? 'border-white/20 hover:border-white/40 hover:scale-105' 
          : 'border-white/10 opacity-50 cursor-not-allowed'
        } ${className}
      `}
    >
      {/* Quest Card Content with Campaign Modal Pattern */}
      <div className="relative h-48 overflow-hidden">
        {/* Background Gradient matching Campaign Modal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Quest Type Icon/Visual */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 flex items-center justify-center">
          <div className="text-6xl opacity-20">
            {quest.type === 'daily' && '📅'}
            {quest.type === 'weekly' && '📊'}
            {quest.type === 'achievement' && '🏆'}
            {quest.type === 'story' && '📖'}
          </div>
        </div>
        
        {/* Status Badge - Exact Campaign Modal Style */}
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium border
            ${quest.status === 'available' 
              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
              : quest.status === 'in_progress'
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              : quest.status === 'completed'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }
          `}>
            {quest.status === 'available' && 'AVAILABLE'}
            {quest.status === 'in_progress' && 'IN PROGRESS'}
            {quest.status === 'completed' && 'COMPLETED'}
            {quest.status === 'locked' && 'LOCKED'}
            {quest.status === 'expired' && 'EXPIRED'}
          </span>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-4 left-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium border
            ${getDifficultyColor(quest.difficulty)}
          `}>
            {quest.difficulty.toUpperCase()}
          </span>
        </div>

        {/* Quest Info - Campaign Modal Style */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-monument text-xl text-white mb-2">
            {quest.title.toUpperCase()}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <span className="text-white/80 text-sm">
              {quest.xpReward} XP • {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)} Quest
            </span>
          </div>
          
          {/* Progress Bar for In-Progress Quests */}
          {quest.status === 'in_progress' && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70 text-xs">Progress</span>
                <span className="text-white text-xs">
                  {quest.progress}/{quest.maxProgress}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                <div 
                  className="bg-gradient-to-r from-white/60 to-white/80 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Description */}
          <p className="text-white/70 text-sm leading-relaxed overflow-hidden" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}>
            {quest.description}
          </p>
        </div>
      </div>

      {/* Hover Effect - Exact Campaign Modal Pattern */}
      {quest.status !== 'locked' && (
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 text-black px-6 py-2 rounded-full font-medium">
            {quest.status === 'available' && 'ACCEPT QUEST'}
            {quest.status === 'in_progress' && 'VIEW PROGRESS'}
            {quest.status === 'completed' && 'VIEW DETAILS'}
          </div>
        </div>
      )}

      {/* Expiry Warning Overlay */}
      {isExpiringSoon() && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white text-center py-2 text-xs font-medium">
          ⚠️ EXPIRES {formatDistanceToNow(new Date(quest.expiresAt!)).toUpperCase()}
        </div>
      )}
    </div>
  );
}
