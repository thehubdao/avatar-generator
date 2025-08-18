export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  progress: number;
  maxProgress: number;
  rewards: QuestReward[];
  requirements?: QuestRequirement[];
  expiresAt?: Date;
  createdAt: Date;
  completedAt?: Date;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xpReward: number;
  tags: string[];
}

export interface QuestReward {
  type: RewardType;
  amount: number;
  itemId?: string;
  description: string;
}

export interface QuestRequirement {
  type: RequirementType;
  value: string | number;
  description: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

export interface QuestProgress {
  questId: string;
  objectives: QuestObjective[];
  startedAt: Date;
  lastUpdated: Date;
}

export interface QuestStats {
  totalCompleted: number;
  totalFailed: number;
  dailyCompleted: number;
  weeklyCompleted: number;
  totalXpEarned: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletionTime: number; // in minutes
  favoriteQuestType: QuestType;
  questsByType: Record<QuestType, number>;
  recentAchievements: string[];
}

export type QuestType = 'daily' | 'weekly' | 'achievement' | 'story' | 'event';
export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'locked' | 'expired';
export type QuestCategory = 'combat' | 'social' | 'exploration' | 'collection' | 'crafting';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type RewardType = 'xp' | 'tokens' | 'badge' | 'item' | 'title';
export type RequirementType = 'level' | 'previous_quest' | 'achievement' | 'item_owned';
