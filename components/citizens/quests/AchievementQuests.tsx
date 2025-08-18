import React from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import QuestList from './QuestList';
import AGButton from '../../../ui/common/ag-button.component';
import AGText from '../../../ui/common/ag-text.component';

interface AchievementQuestsProps {
  quests: Quest[];
  onAccept?: (questId: string) => void;
  onView?: (quest: Quest) => void;
  className?: string;
}

export default function AchievementQuests({ quests, onAccept, onView, className = '' }: AchievementQuestsProps) {
  const achievementQuests = quests.filter(quest => quest.type === 'achievement');
  
  const completedAchievements = achievementQuests.filter(q => q.status === 'completed').length;
  const totalAchievements = achievementQuests.length;
  const completionRate = totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0;

  // Group achievements by category
  const groupedAchievements = achievementQuests.reduce((groups, quest) => {
    const category = quest.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(quest);
    return groups;
  }, {} as Record<string, Quest[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'combat': return '⚔️';
      case 'social': return '👥';
      case 'exploration': return '🗺️';
      case 'collection': return '📦';
      case 'crafting': return '🔨';
      default: return '🏆';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat': return 'from-red-500 to-red-600';
      case 'social': return 'from-blue-500 to-blue-600';
      case 'exploration': return 'from-green-500 to-green-600';
      case 'collection': return 'from-purple-500 to-purple-600';
      case 'crafting': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAchievementTier = (completedCount: number) => {
    if (completedCount >= 50) return { name: 'Legendary', icon: '🏆', color: 'text-yellow-500' };
    if (completedCount >= 25) return { name: 'Epic', icon: '💎', color: 'text-purple-500' };
    if (completedCount >= 10) return { name: 'Rare', icon: '⭐', color: 'text-blue-500' };
    if (completedCount >= 5) return { name: 'Uncommon', icon: '🔹', color: 'text-green-500' };
    return { name: 'Common', icon: '⚪', color: 'text-gray-500' };
  };

  const currentTier = getAchievementTier(completedAchievements);

  return (
    <div className={`w-full ${className}`}>
      {/* Achievement Header with Neumorphic Design */}
      <div className="bg-slate-100 dark:bg-citizens-dark rounded-lg shadow-flat-soft dark:shadow-flat-soft-dark p-6 mb-6 border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-start">
          <div>
            <AGText type="th2" side="left">🏆 Achievements</AGText>
            <AGText type="text">
              Long-term goals that showcase your dedication and skill. Unlock prestigious rewards!
            </AGText>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentTier.icon}</span>
                <div>
                  <AGText type="th3">{currentTier.name} Tier</AGText>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{completedAchievements} Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <div>
                  <AGText type="th3">{completionRate.toFixed(1)}%</AGText>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Completion Rate</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Achievement Progress Circle with Neumorphic Style */}
          <div className="relative w-20 h-20 shadow-inset-soft dark:shadow-inset-medium rounded-full bg-slate-100 dark:bg-citizens-dark">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-300 dark:text-gray-600"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-citizens-blue"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${completionRate}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-light text-gray-800 dark:text-white">{Math.round(completionRate)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Categories with Neumorphic Design */}
      {Object.keys(groupedAchievements).length > 1 && (
        <div className="mb-6">
          <AGText type="th3" side="left">Categories</AGText>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
            {Object.entries(groupedAchievements).map(([category, categoryQuests]) => {
              const completed = categoryQuests.filter(q => q.status === 'completed').length;
              const total = categoryQuests.length;
              const percentage = total > 0 ? (completed / total) * 100 : 0;
              
              return (
                <div 
                  key={category}
                  className="bg-slate-100 dark:bg-citizens-dark rounded-lg shadow-flat-soft dark:shadow-flat-soft-dark p-4 cursor-pointer hover:shadow-flat-medium hover:dark:shadow-flat-medium-dark transition-all duration-300 border border-gray-200 dark:border-gray-600"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getCategoryIcon(category)}</div>
                    <div className="font-light capitalize text-sm text-gray-800 dark:text-white">{category}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{completed}/{total}</div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1 mt-2 shadow-inset-soft">
                      <div 
                        className="bg-citizens-blue h-1 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tier Progress with Neumorphic Design */}
      <div className="mb-6">
        <AGText type="th3" side="left">Achievement Tiers</AGText>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          {[
            { name: 'Common', icon: '⚪', required: 0, color: 'gray' },
            { name: 'Uncommon', icon: '🔹', required: 5, color: 'green' },
            { name: 'Rare', icon: '⭐', required: 10, color: 'blue' },
            { name: 'Epic', icon: '💎', required: 25, color: 'purple' },
            { name: 'Legendary', icon: '🏆', required: 50, color: 'yellow' },
          ].map((tier) => {
            const isUnlocked = completedAchievements >= tier.required;
            const isCurrent = currentTier.name === tier.name;
            
            return (
              <div 
                key={tier.name}
                className={`p-4 rounded-lg shadow-flat-soft dark:shadow-flat-soft-dark transition-all duration-300 border-2 
                  ${isUnlocked 
                    ? 'bg-slate-100 dark:bg-citizens-dark border-citizens-blue text-gray-800 dark:text-white' 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  } 
                  ${isCurrent ? 'shadow-flat-medium dark:shadow-flat-medium-dark border-citizens-yellow' : ''}`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{tier.icon}</div>
                  <div className="font-light text-sm">{tier.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{tier.required} required</div>
                  {isCurrent && (
                    <div className="text-xs font-light text-citizens-blue mt-1">Current Tier</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Achievements with Neumorphic Design */}
      {completedAchievements > 0 && (
        <div className="mb-6">
          <AGText type="th3" side="left">Recent Achievements</AGText>
          <div className="bg-slate-100 dark:bg-citizens-dark shadow-flat-soft dark:shadow-flat-soft-dark border border-gray-200 dark:border-gray-600 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <AGText type="th3">Achievement Unlocked!</AGText>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  You&apos;ve completed {completedAchievements} achievement{completedAchievements !== 1 ? 's' : ''}. Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quest List */}
      <QuestList
        quests={achievementQuests}
        onAccept={onAccept}
        onView={onView}
        title="All Achievements"
        emptyMessage="No achievements available yet. Complete more activities to unlock achievements!"
      />
    </div>
  );
}
