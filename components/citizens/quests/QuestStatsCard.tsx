import React from 'react';
import { Quest, QuestStats } from '../../../interfaces/quest.interface';
import AGText from '../../../ui/common/ag-text.component';

interface QuestStatsCardProps {
  stats: QuestStats;
  quests: Quest[];
  className?: string;
}

export default function QuestStatsCard({ stats, quests, className = '' }: QuestStatsCardProps) {
  // Mock user level and XP data - in real app this would come from user profile
  const currentLevel = 15;
  const currentXP = 12450;

  // Calculate additional stats
  const completionRate = stats.totalCompleted > 0 ? (stats.totalCompleted / (stats.totalCompleted + stats.totalFailed)) * 100 : 0;
  const activeQuests = quests.filter(q => q.status === 'in_progress').length;
  const availableQuests = quests.filter(q => q.status === 'available').length;
  
  // Calculate streak data
  const currentStreak = CalculateCurrentStreak(quests);
  const longestStreak = stats.longestStreak || 0;

  // XP Progress calculation (assuming 1000 XP per level)
  const xpPerLevel = 1000;
  const xpInCurrentLevel = currentXP % xpPerLevel;
  const xpToNextLevel = xpPerLevel - xpInCurrentLevel;
  const levelProgress = (xpInCurrentLevel / xpPerLevel) * 100;

  return (
    <div className={`bg-slate-100 dark:bg-citizens-dark rounded-xl shadow-flat-soft dark:shadow-flat-soft-dark border border-gray-200 dark:border-gray-600 overflow-hidden ${className}`}>
      {/* Header with Neumorphic Design */}
      <div className="bg-slate-100 dark:bg-citizens-dark shadow-inset-soft px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <AGText type="th3" side="left">
          <span className="text-citizens-blue">📊</span> Quest Statistics
        </AGText>
      </div>

      <div className="p-6 space-y-6">
        {/* Level & XP Progress with Neumorphic Style */}
        <div className="bg-slate-100 dark:bg-citizens-dark shadow-flat-soft dark:shadow-flat-soft-dark rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <AGText type="th3">{`Level ${currentLevel}`}</AGText>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentXP.toLocaleString()} XP Total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-light text-gray-800 dark:text-white">
                {xpToNextLevel} XP to Level {currentLevel + 1}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 shadow-inset-soft">
            <div 
              className="bg-gradient-to-r from-citizens-yellow to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Stats Grid with Neumorphic Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-100 dark:bg-citizens-dark shadow-flat-soft dark:shadow-flat-soft-dark rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-light text-green-600 dark:text-green-400">{stats.totalCompleted}</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-light">Completed</p>
              </div>
              <span className="text-green-500 text-2xl">✅</span>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-citizens-dark shadow-flat-soft dark:shadow-flat-soft-dark rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-light text-citizens-blue">{activeQuests}</p>
                <p className="text-sm text-blue-600 font-light">Active</p>
              </div>
              <span className="text-blue-500 text-2xl">⚡</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-light text-purple-700">{availableQuests}</p>
                <p className="text-sm text-purple-600 font-light">Available</p>
              </div>
              <span className="text-purple-500 text-2xl">📋</span>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-light text-yellow-700">{stats.totalXpEarned}</p>
                <p className="text-sm text-yellow-600 font-light">XP Earned</p>
              </div>
              <span className="text-yellow-500 text-2xl">⭐</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Rate */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h4 className="font-light text-gray-800 mb-3 flex items-center gap-2">
              <span>🎯</span>
              Success Rate
            </h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-light text-gray-800">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.totalCompleted} completed • {stats.totalFailed} failed
            </div>
          </div>

          {/* Streak Information */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <h4 className="font-light text-gray-800 mb-3 flex items-center gap-2">
              <span>🔥</span>
              Quest Streaks
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Streak</span>
                <span className="font-light text-orange-600">{currentStreak} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Longest Streak</span>
                <span className="font-light text-orange-800">{longestStreak} days</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Keep completing daily quests to maintain your streak!
              </div>
            </div>
          </div>
        </div>

        {/* Quest Type Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <h4 className="font-light text-gray-800 mb-3 flex items-center gap-2">
            <span>📈</span>
            Quest Type Breakdown
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.questsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                <span className="font-light text-gray-800">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        {stats.recentAchievements && stats.recentAchievements.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h4 className="font-light text-gray-800 mb-3 flex items-center gap-2">
              <span>🏆</span>
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {stats.recentAchievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="text-purple-500">🎖️</span>
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate current streak
function CalculateCurrentStreak(quests: Quest[]): number {
  const completedQuests = quests
    .filter(q => q.status === 'completed' && q.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  if (completedQuests.length === 0) return 0;

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const quest of completedQuests) {
    const questDate = new Date(quest.completedAt!);
    questDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate.getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}
