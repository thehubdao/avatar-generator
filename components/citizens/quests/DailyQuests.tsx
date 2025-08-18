import React from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import QuestList from './QuestList';

interface DailyQuestsProps {
  quests: Quest[];
  onAccept?: (questId: string) => void;
  onView?: (quest: Quest) => void;
  className?: string;
}

export default function DailyQuests({ quests, onAccept, onView, className = '' }: DailyQuestsProps) {
  const dailyQuests = quests.filter(quest => quest.type === 'daily');
  
  // Calculate time until reset (assuming daily reset at midnight UTC)
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(now.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    const timeLeft = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  const { hours, minutes } = getTimeUntilReset();
  const completedToday = dailyQuests.filter(q => q.status === 'completed').length;
  const availableToday = dailyQuests.filter(q => q.status === 'available' || q.status === 'in_progress').length;

  return (
    <div className={`w-full ${className}`}>
      {/* Daily Quests Header - Campaign Modal Style */}
      <div className="bg-gradient-to-b from-[#151515] to-[#0C0C0C] rounded-3xl p-8 mb-6 border border-white/10 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-monument text-3xl md:text-4xl text-white mb-4">
              ☀️ DAILY QUESTS
            </h2>
            <p className="text-white/70 text-lg mb-6">
              Complete daily challenges to earn XP and rewards. New quests available every day!
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <div className="font-medium text-white text-lg">{completedToday} Completed</div>
                  <div className="text-white/50 text-sm">Today</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <div className="font-medium text-white text-lg">{availableToday} Available</div>
                  <div className="text-white/50 text-sm">Remaining</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reset Timer - Campaign Modal Style */}
          <div className="text-right">
            <div className="bg-white/10 hover:bg-white/20 transition-colors duration-200 rounded-2xl p-4 border border-white/20">
              <div className="text-sm text-white/70 mb-2">Resets in</div>
              <div className="font-monument text-2xl text-white">
                {hours}h {minutes}m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - Campaign Modal Style */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-white text-lg">Daily Progress</span>
          <span className="text-white/70">
            {completedToday}/{dailyQuests.length} Complete
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-4 backdrop-blur-sm border border-white/20">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-500 shadow-lg"
            style={{ 
              width: `${dailyQuests.length > 0 ? (completedToday / dailyQuests.length) * 100 : 0}%` 
            }}
          />
        </div>
      </div>

      {/* Daily Bonus Info - Campaign Modal Style */}
      {completedToday === dailyQuests.length && dailyQuests.length > 0 && (
        <div className="relative group cursor-pointer rounded-2xl overflow-hidden border-2 border-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300 mb-8">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm p-6">
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 via-transparent to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                COMPLETED
              </span>
            </div>

            {/* Content */}
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-green-400 text-2xl">🎉</span>
              </div>
              <div>
                <h3 className="font-monument text-xl text-white mb-2">
                  ALL DAILY QUESTS COMPLETE!
                </h3>
                <p className="text-white/70">
                  You've completed all daily quests. Check back tomorrow for new challenges!
                </p>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/90 text-black px-6 py-2 rounded-full font-medium">
                WELL DONE!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quest List Container - Campaign Modal Style */}
      <div className="bg-gradient-to-b from-[#151515] to-[#0C0C0C] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <h3 className="font-monument text-2xl text-white mb-2">
              TODAY'S QUESTS
            </h3>
            <p className="text-white/70">
              Complete these challenges before they reset
            </p>
          </div>
          
          <QuestList
            quests={dailyQuests}
            onAccept={onAccept}
            onView={onView}
            emptyMessage="No daily quests available. Check back tomorrow!"
            showFilters={false}
          />
        </div>
      </div>
    </div>
  );
}
