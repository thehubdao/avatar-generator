import React, { useState } from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import { useQuests } from '../../../hooks/useQuests';
import DailyQuests from './DailyQuests';
import WeeklyQuests from './WeeklyQuests';
import AchievementQuests from './AchievementQuests';
import QuestDetails from './QuestDetails';
import QuestTracker from './QuestTracker';
import AGText from '../../../ui/common/ag-text.component';
import AGButton from '../../../ui/common/ag-button.component';

interface QuestDashboardProps {
  className?: string;
}

export default function QuestDashboard({ className = '' }: QuestDashboardProps) {
  const { 
    quests, 
    activeQuests, 
    questStats, 
    loading: isLoading, 
    error, 
    acceptQuest, 
    completeQuest,
    refreshQuests 
  } = useQuests();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'achievements' | 'story'>('daily');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const tabs = [
    { id: 'daily', label: 'Daily', icon: '📅', count: quests.filter(q => q.type === 'daily').length },
    { id: 'weekly', label: 'Weekly', icon: '📊', count: quests.filter(q => q.type === 'weekly').length },
    { id: 'achievements', label: 'Achievements', icon: '🏆', count: quests.filter(q => q.type === 'achievement').length },
    { id: 'story', label: 'Story', icon: '📖', count: quests.filter(q => q.type === 'story').length },
  ];

  const handleAcceptQuest = async (questId: string) => {
    await acceptQuest(questId);
  };

  const handleCompleteQuest = async (questId: string) => {
    await completeQuest(questId);
    setSelectedQuest(null);
  };

  const handleViewQuest = (quest: Quest) => {
    setSelectedQuest(quest);
  };

  const handleCloseDetails = () => {
    setSelectedQuest(null);
  };

  if (isLoading) {
    return (
      <div className={`relative w-full min-h-screen py-32 px-6 2xl:px-0 ${className}`}>
        <div className="container mx-auto">
          <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-citizens-blue"></div>
              <span className="ml-3 text-white font-light">Loading quests...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative w-full min-h-screen py-32 px-6 2xl:px-0 ${className}`}>
        <div className="container mx-auto">
          <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl p-8">
            <div className="text-center">
              <div className="text-citizens-red text-6xl mb-4">⚠️</div>
              <AGText type="th2" side="center">Error Loading Quests</AGText>
              <AGText type="text">{error}</AGText>
              <div className="pt-6">
                <AGButton 
                  type="alert" 
                  onClickEvent={refreshQuests}
                  nm
                >
                  Try Again
                </AGButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full min-h-screen py-32 px-6 2xl:px-0 ${className}`}>
      <div className="container mx-auto">
        {/* Quest Statistics Header - Citizens Dark Theme */}
        <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl mb-8 overflow-hidden">
          {/* Header Section */}
          <div className="border-b border-white/20 p-4 sm:p-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div>
                <AGText type="th1" side="left">
                  <span className="text-white font-monument">QUEST DASHBOARD</span>
                </AGText>
              </div>
              <AGButton 
                type="secondary" 
                onClickEvent={refreshQuests}
                nm
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </div>
              </AGButton>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#2D2D2D] shadow-citizens-input rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-citizens-blue text-2xl">📋</span>
                  <div>
                    <div className="text-2xl font-bold text-white">{activeQuests.length}</div>
                    <div className="text-gray-300 text-sm font-light">Active Quests</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#2D2D2D] shadow-citizens-input rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-2xl">✅</span>
                  <div>
                    <div className="text-2xl font-bold text-white">{questStats.totalCompleted}</div>
                    <div className="text-gray-300 text-sm font-light">Completed</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#2D2D2D] shadow-citizens-input rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-citizens-yellow text-2xl">⭐</span>
                  <div>
                    <div className="text-2xl font-bold text-white">{questStats.totalXpEarned.toLocaleString()}</div>
                    <div className="text-gray-300 text-sm font-light">Total XP</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#2D2D2D] shadow-citizens-input rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 text-2xl">🔥</span>
                  <div>
                    <div className="text-2xl font-bold text-white">{questStats.currentStreak}</div>
                    <div className="text-gray-300 text-sm font-light">Current Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Navigation - Citizens Style */}
            <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl mb-6 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-white/20">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[#2D2D2D] text-citizens-blue shadow-citizens-input'
                        : 'text-gray-300 hover:text-white hover:bg-[#2D2D2D]'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-light">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-citizens-input ${
                        activeTab === tab.id
                          ? 'bg-citizens-blue text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {activeTab === 'daily' && (
                <DailyQuests
                  quests={quests}
                  onAccept={handleAcceptQuest}
                  onView={handleViewQuest}
                />
              )}
              {activeTab === 'weekly' && (
                <WeeklyQuests
                  quests={quests}
                  onAccept={handleAcceptQuest}
                  onView={handleViewQuest}
                />
              )}
              {activeTab === 'achievements' && (
                <AchievementQuests
                  quests={quests}
                  onAccept={handleAcceptQuest}
                  onView={handleViewQuest}
                />
              )}
              {activeTab === 'story' && (
                <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl p-8">
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📖</div>
                    <AGText type="th3" side="center">Story Quests Coming Soon</AGText>
                    <AGText type="text">
                      Epic story campaigns will be available in a future update. Stay tuned!
                    </AGText>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quest Tracker Sidebar - Citizens Style */}
          {activeQuests.length > 0 && (
            <div className="w-80 hidden lg:block">
              <QuestTracker
                quests={activeQuests}
                onView={handleViewQuest}
                className="sticky top-6"
              />
            </div>
          )}
        </div>

        {/* Quest Details Modal */}
        {selectedQuest && (
          <QuestDetails
            quest={selectedQuest}
            onClose={handleCloseDetails}
            onAccept={handleAcceptQuest}
            onComplete={handleCompleteQuest}
          />
        )}
      </div>
    </div>
  );
}
