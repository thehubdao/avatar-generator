import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setLoading } from '../../../store/questSlice';
import { Quest, QuestType, QuestDifficulty, QuestStatus } from '../../../interfaces/quest.interface';
import QuestStatsCard from './QuestStatsCard';
import QuestFilters from './QuestFilters';
import QuestNotificationManager from './QuestNotificationManager';
import DailyQuests from './DailyQuests';
import WeeklyQuests from './WeeklyQuests';
import AchievementQuests from './AchievementQuests';
import QuestList from './QuestList';
import AGText from '../../../ui/common/ag-text.component';
import AGButton from '../../../ui/common/ag-button.component';
import LoadingUI from '../../../ui/citizens/common/loading.ui';

interface EnhancedQuestDashboardProps {
  className?: string;
}

// Filter interface for quest filtering
interface QuestFiltersState {
  search: string;
  type: QuestType | 'all';
  difficulty: QuestDifficulty | 'all';
  status: QuestStatus | 'all';
  sortBy: 'title' | 'difficulty' | 'xpReward' | 'deadline' | 'progress';
  sortOrder: 'asc' | 'desc';
}

export default function EnhancedQuestDashboard({ className = '' }: EnhancedQuestDashboardProps) {
  const { quests, loading: isLoading, questStats } = useAppSelector(state => state.quest);
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'weekly' | 'achievement' | 'all'>('overview');
  const [filters, setFilters] = useState<QuestFiltersState>({
    search: '',
    type: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'title',
    sortOrder: 'asc'
  });

  // Fetch quests on component mount
  const refreshQuestsData = () => {
    dispatch(setLoading(true));
    // Add quest refresh logic here
    setTimeout(() => dispatch(setLoading(false)), 1000);
  };

  useEffect(() => {
    refreshQuestsData();
  }, [dispatch]);

  // Filter and sort quests based on current filters
  const getFilteredQuests = (): Quest[] => {
    let filtered = [...quests];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        quest.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        quest.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(quest => quest.type === filters.type);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(quest => quest.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'title': {
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        }
        case 'difficulty': {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3, legendary: 4 };
          aValue = difficultyOrder[a.difficulty];
          bValue = difficultyOrder[b.difficulty];
          break;
        }
        case 'xpReward':
          aValue = a.xpReward;
          bValue = b.xpReward;
          break;
        case 'deadline':
          aValue = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
          bValue = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
          break;
        case 'progress':
          aValue = a.maxProgress > 0 ? (a.progress / a.maxProgress) : 0;
          bValue = b.maxProgress > 0 ? (b.progress / b.maxProgress) : 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'daily', label: 'Daily', icon: '☀️' },
    { id: 'weekly', label: 'Weekly', icon: '📅' },
    { id: 'achievement', label: 'Achievements', icon: '🏆' },
    { id: 'all', label: 'All Quests', icon: '📋' }
  ];

  if (isLoading) {
    return (
      <div className="relative w-full min-h-screen py-32 px-6 2xl:px-0">
        <LoadingUI
          loadingText='Loading quest dashboard'
          errorText='Sorry, quest data is not loaded, try again later.'
          dataValidate={quests}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen py-32 px-6 2xl:px-0">
      <div className="container mx-auto">
        {/* Quest Notification Manager */}
        <QuestNotificationManager />
        
        {/* Main Dashboard Container */}
        <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-white/20 p-4 sm:p-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div>
                <AGText type="th1" side="left">
                  <span className="text-white font-monument">QUEST DASHBOARD</span>
                </AGText>
                <p className="text-gray-300 font-light mt-2">Track your progress and discover new adventures</p>
              </div>
              <AGButton 
                type="secondary" 
                onClickEvent={refreshQuestsData}
                nm
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Quests
                </div>
              </AGButton>
            </div>
          </div>

          {/* Tab Navigation - Citizens Style */}
          <div className="border-b border-white/20">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-citizens-blue bg-[#2D2D2D] shadow-citizens-input border-b-2 border-citizens-blue'
                      : 'text-gray-300 hover:text-white hover:bg-[#2D2D2D]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-light">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quest Filters - Show for 'all' tab with Citizens styling */}
          {activeTab === 'all' && (
            <div className="p-4 sm:p-8 border-b border-white/20">
              <QuestFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          )}

          {/* Tab Content */}
          <div className="p-4 sm:p-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                  <QuestStatsCard stats={questStats} quests={quests} />
                </div>
                <div className="xl:col-span-2 space-y-6">
                  <DailyQuests quests={quests.filter(q => q.type === 'daily')} />
                  <WeeklyQuests quests={quests.filter(q => q.type === 'weekly')} />
                  <AchievementQuests quests={quests.filter(q => q.type === 'achievement')} />
                </div>
              </div>
            )}

            {activeTab === 'daily' && (
              <DailyQuests quests={quests.filter(q => q.type === 'daily')} />
            )}

            {activeTab === 'weekly' && (
              <WeeklyQuests quests={quests.filter(q => q.type === 'weekly')} />
            )}

            {activeTab === 'achievement' && (
              <AchievementQuests quests={quests.filter(q => q.type === 'achievement')} />
            )}

            {activeTab === 'all' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <QuestStatsCard stats={questStats} quests={quests} />
                </div>
                <div className="lg:col-span-2">
                  <QuestList 
                    quests={getFilteredQuests()} 
                    title="All Quests"
                    showFilters={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State - Citizens Style */}
        {quests.length === 0 && (
          <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl p-8 mt-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <AGText type="th2" side="center">
                <span className="text-white">No Quests Available</span>
              </AGText>
              <AGText type="text">
                <span className="text-gray-300">Check back later for new adventures and challenges!</span>
              </AGText>
              <div className="pt-6">
                <AGButton
                  type="secondary"
                  onClickEvent={refreshQuestsData}
                  nm
                >
                  Refresh Quests
                </AGButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
