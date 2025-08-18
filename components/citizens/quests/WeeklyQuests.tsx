import React from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import QuestList from './QuestList';
import AGText from '../../../ui/common/ag-text.component';

interface WeeklyQuestsProps {
  quests: Quest[];
  onAccept?: (questId: string) => void;
  onView?: (quest: Quest) => void;
  className?: string;
}

export default function WeeklyQuests({ quests, onAccept, onView, className = '' }: WeeklyQuestsProps) {
  const weeklyQuests = quests.filter(quest => quest.type === 'weekly');
  
  // Calculate time until weekly reset (assuming Monday reset at midnight UTC)
  const getTimeUntilWeeklyReset = () => {
    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay) % 7;
    
    const nextReset = new Date(now);
    nextReset.setUTCDate(now.getUTCDate() + daysUntilMonday);
    nextReset.setUTCHours(0, 0, 0, 0);
    
    const timeLeft = nextReset.getTime() - now.getTime();
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours };
  };

  const { days, hours } = getTimeUntilWeeklyReset();
  const completedThisWeek = weeklyQuests.filter(q => q.status === 'completed').length;
  const availableThisWeek = weeklyQuests.filter(q => q.status === 'available' || q.status === 'in_progress').length;

  return (
    <div className={`w-full ${className}`}>
      {/* Weekly Quests Header - Updated to match Campaign Modal Style */}
      <div className="bg-gradient-to-b from-[#151515] to-[#0C0C0C] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm p-8 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="font-monument text-3xl md:text-4xl text-white mb-4 flex items-center gap-3">
                <span className="text-4xl">📅</span>
                WEEKLY QUESTS
              </h2>
              <div className="h-1 w-20 bg-white/20 rounded-full"></div>
            </div>
            <p className="text-white/70 text-lg mb-6">
              Tackle challenging weekly objectives for bigger rewards. New quests every Monday!
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <div className="font-medium text-white text-xl">{completedThisWeek}</div>
                  <div className="text-white/70 text-sm">Completed This Week</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <div className="font-medium text-white text-xl">{availableThisWeek}</div>
                  <div className="text-white/70 text-sm">Available Remaining</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reset Timer - Matching Campaign Modal Card Style */}
          <div className="text-right">
            <div className="bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm p-4 min-w-[120px]">
              <div className="text-sm text-white/70 mb-2">Resets in</div>
              <div className="font-monument text-2xl text-white">
                {days}d {hours}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress - Styled like Campaign Modal */}
      <div className="bg-gradient-to-b from-[#151515] to-[#0C0C0C] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm p-8 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-white">Weekly Progress</span>
          <span className="text-white/70">
            {completedThisWeek}/{weeklyQuests.length} Complete
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm border border-white/10">
          <div 
            className="bg-gradient-to-r from-purple-400 to-purple-500 h-4 rounded-full transition-all duration-500 shadow-lg"
            style={{ 
              width: `${weeklyQuests.length > 0 ? (completedThisWeek / weeklyQuests.length) * 100 : 0}%` 
            }}
          />
        </div>
      </div>

      {/* Weekly Milestone Rewards - Matching Campaign Modal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
          completedThisWeek >= 1 
            ? 'border-green-500/40 bg-gradient-to-br from-green-500/10 to-green-600/5' 
            : 'border-white/20 bg-gradient-to-br from-[#151515] to-[#0C0C0C]'
        }`}>
          <div className="p-6">
            <div className="text-3xl mb-3">🥉</div>
            <h3 className="font-monument text-lg text-white mb-2">BRONZE MILESTONE</h3>
            <p className="text-white/70 text-sm mb-2">Complete 1 weekly quest</p>
            <p className="text-green-400 text-xs font-medium">+50 Bonus XP</p>
            {completedThisWeek >= 1 && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
          completedThisWeek >= Math.ceil(weeklyQuests.length / 2) 
            ? 'border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-600/5' 
            : 'border-white/20 bg-gradient-to-br from-[#151515] to-[#0C0C0C]'
        }`}>
          <div className="p-6">
            <div className="text-3xl mb-3">🥈</div>
            <h3 className="font-monument text-lg text-white mb-2">SILVER MILESTONE</h3>
            <p className="text-white/70 text-sm mb-2">Complete {Math.ceil(weeklyQuests.length / 2)} weekly quests</p>
            <p className="text-blue-400 text-xs font-medium">+100 Bonus XP</p>
            {completedThisWeek >= Math.ceil(weeklyQuests.length / 2) && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
          completedThisWeek >= weeklyQuests.length && weeklyQuests.length > 0
            ? 'border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5' 
            : 'border-white/20 bg-gradient-to-br from-[#151515] to-[#0C0C0C]'
        }`}>
          <div className="p-6">
            <div className="text-3xl mb-3">🥇</div>
            <h3 className="font-monument text-lg text-white mb-2">GOLD MILESTONE</h3>
            <p className="text-white/70 text-sm mb-2">Complete all weekly quests</p>
            <p className="text-yellow-400 text-xs font-medium">+200 Bonus XP + Rare Item</p>
            {completedThisWeek >= weeklyQuests.length && weeklyQuests.length > 0 && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Banner - Matching Campaign Modal Style */}
      {completedThisWeek === weeklyQuests.length && weeklyQuests.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 border border-yellow-500/40 rounded-3xl backdrop-blur-sm p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
              <span className="text-4xl">🎖️</span>
            </div>
            <div>
              <h3 className="font-monument text-2xl text-white mb-2">WEEKLY CHAMPION!</h3>
              <p className="text-white/80 text-lg">
                Outstanding! You&apos;ve completed all weekly quests. Your dedication is legendary!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quest List */}
      <QuestList
        quests={weeklyQuests}
        onAccept={onAccept}
        onView={onView}
        emptyMessage="No weekly quests available. Check back on Monday for new challenges!"
        showFilters={false}
      />
    </div>
  );
}
