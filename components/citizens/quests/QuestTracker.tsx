import React from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import QuestProgress from './QuestProgress';
import AGText from '../../../ui/common/ag-text.component';
import AGButton from '../../../ui/common/ag-button.component';

interface QuestTrackerProps {
  quests: Quest[];
  onView?: (quest: Quest) => void;
  className?: string;
}

export default function QuestTracker({ quests, onView, className = '' }: QuestTrackerProps) {
  const sortedQuests = quests
    .filter(quest => quest.status === 'in_progress')
    .sort((a, b) => {
      // Sort by progress percentage (closest to completion first)
      const aProgress = a.maxProgress > 0 ? (a.progress / a.maxProgress) : 0;
      const bProgress = b.maxProgress > 0 ? (b.progress / b.maxProgress) : 0;
      return bProgress - aProgress;
    })
    .slice(0, 5); // Show max 5 active quests

  if (sortedQuests.length === 0) {
    return (
      <div className={`shadow-citizens-btn bg-citizens-dark rounded-2xl p-4 ${className}`}>
        <AGText type="th3" side="left">
          <span className="text-white">Active Quests</span>
        </AGText>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <p className="text-gray-300 text-sm font-light">No active quests</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`shadow-citizens-btn bg-citizens-dark rounded-2xl ${className}`}>
      <div className="p-4 border-b border-white/20">
        <AGText type="th3" side="left">
          <span className="text-white">Active Quests</span>
        </AGText>
        <p className="text-gray-300 text-sm font-light">Track your progress</p>
      </div>
      <div className="p-4 space-y-4">
        {sortedQuests.map(quest => {
          const progressPercentage = quest.maxProgress > 0 ? (quest.progress / quest.maxProgress) * 100 : 0;
          const isNearCompletion = progressPercentage >= 80;
          
          return (
            <div key={quest.id} className="space-y-2 bg-[#2D2D2D] shadow-citizens-input rounded-xl p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <h4 className="font-light text-white text-sm line-clamp-2">
                    {quest.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-light shadow-citizens-input ${
                      quest.type === 'daily' ? 'text-citizens-blue bg-[#1a1a1a]' :
                      quest.type === 'weekly' ? 'text-purple-400 bg-[#1a1a1a]' :
                      quest.type === 'achievement' ? 'text-citizens-yellow bg-[#1a1a1a]' :
                      'text-gray-300 bg-[#1a1a1a]'
                    }`}>
                      {quest.type}
                    </span>
                    {isNearCompletion && (
                      <span className="text-green-400 text-xs font-light">⚡ Almost done!</span>
                    )}
                  </div>
                </div>
                
                {onView && (
                  <AGButton
                    type="secondary"
                    onClickEvent={() => onView(quest)}
                    fit
                    nm
                  >
                    View
                  </AGButton>
                )}
              </div>
              
              <QuestProgress
                progress={quest.progress}
                maxProgress={quest.maxProgress}
                size="sm"
                color={isNearCompletion ? 'green' : 'blue'}
                showPercentage={true}
              />
              
              {/* Reward Preview */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-xs text-gray-300 font-light">
                  <span className="text-citizens-yellow">⭐</span>
                  <span>{quest.xpReward} XP</span>
                </div>
                {quest.rewards.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-300 font-light">
                    <span className="text-green-400">🎁</span>
                    <span>{quest.rewards.length} reward{quest.rewards.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {quests.filter(q => q.status === 'in_progress').length > 5 && (
        <div className="p-4 border-t border-white/20">
          <AGButton
            type="primary"
            onClickEvent={() => {/* View all handler */}}
            full
            nm
          >
            {`View All Active Quests (${quests.filter(q => q.status === 'in_progress').length})`}
          </AGButton>
        </div>
      )}
    </div>
  );
}
