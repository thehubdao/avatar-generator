import { Quest, QuestProgress, QuestStats } from '../interfaces/quest.interface';

export type QuestContextType = {
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  questProgress: Record<string, QuestProgress>;
  questStats: QuestStats;
  loading: boolean;
  error: string | null;
};

export type QuestFilterType = 'all' | 'available' | 'in_progress' | 'completed';
export type QuestSortType = 'newest' | 'oldest' | 'difficulty' | 'rewards' | 'expiry';
