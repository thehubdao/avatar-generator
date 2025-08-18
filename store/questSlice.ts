import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Quest, QuestProgress, QuestStats } from '../interfaces/quest.interface';

interface QuestState {
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  questProgress: Record<string, QuestProgress>;
  questStats: QuestStats;
  selectedQuest: Quest | null;
  loading: boolean;
  error: string | null;
  activeTab: 'daily' | 'weekly' | 'achievements' | 'story';
  filters: {
    category: string;
    difficulty: string;
    status: string;
  };
}

const initialState: QuestState = {
  quests: [],
  activeQuests: [],
  completedQuests: [],
  questProgress: {},
  questStats: {
    totalCompleted: 0,
    totalFailed: 0,
    dailyCompleted: 0,
    weeklyCompleted: 0,
    totalXpEarned: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageCompletionTime: 0,
    favoriteQuestType: 'daily',
    questsByType: {
      daily: 0,
      weekly: 0,
      achievement: 0,
      story: 0,
      event: 0
    },
    recentAchievements: []
  },
  selectedQuest: null,
  loading: false,
  error: null,
  activeTab: 'daily',
  filters: {
    category: 'all',
    difficulty: 'all',
    status: 'all',
  },
};

const questSlice = createSlice({
  name: 'quest',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setQuests: (state, action: PayloadAction<Quest[]>) => {
      state.quests = action.payload;
      state.activeQuests = action.payload.filter(q => q.status === 'in_progress');
      state.completedQuests = action.payload.filter(q => q.status === 'completed');
    },
    acceptQuest: (state, action: PayloadAction<string>) => {
      const quest = state.quests.find(q => q.id === action.payload);
      if (quest && quest.status === 'available') {
        quest.status = 'in_progress';
        state.activeQuests.push(quest);
      }
    },
    updateQuestProgress: (state, action: PayloadAction<{ questId: string; progress: number }>) => {
      const { questId, progress } = action.payload;
      const quest = state.quests.find(q => q.id === questId);
      if (quest) {
        quest.progress = Math.min(progress, quest.maxProgress);
        if (quest.progress >= quest.maxProgress) {
          quest.status = 'completed';
          quest.completedAt = new Date();
          state.activeQuests = state.activeQuests.filter(q => q.id !== questId);
          state.completedQuests.push(quest);
          state.questStats.totalCompleted += 1;
          state.questStats.totalXpEarned += quest.xpReward;
        }
      }
    },
    completeQuest: (state, action: PayloadAction<string>) => {
      const quest = state.quests.find(q => q.id === action.payload);
      if (quest && quest.status === 'in_progress') {
        quest.status = 'completed';
        quest.progress = quest.maxProgress;
        quest.completedAt = new Date();
        state.activeQuests = state.activeQuests.filter(q => q.id !== action.payload);
        state.completedQuests.push(quest);
        state.questStats.totalCompleted += 1;
        state.questStats.totalXpEarned += quest.xpReward;
      }
    },
    setSelectedQuest: (state, action: PayloadAction<Quest | null>) => {
      state.selectedQuest = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'daily' | 'weekly' | 'achievements' | 'story'>) => {
      state.activeTab = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<QuestState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateQuestStats: (state, action: PayloadAction<Partial<QuestStats>>) => {
      state.questStats = { ...state.questStats, ...action.payload };
    },
    resetQuests: (state) => {
      state.quests = [];
      state.activeQuests = [];
      state.completedQuests = [];
      state.questProgress = {};
      state.selectedQuest = null;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setQuests,
  acceptQuest,
  updateQuestProgress,
  completeQuest,
  setSelectedQuest,
  setActiveTab,
  setFilters,
  updateQuestStats,
  resetQuests,
} = questSlice.actions;

export default questSlice.reducer;
