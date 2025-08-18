import { Quest, QuestStats, QuestType, QuestDifficulty, QuestStatus } from '../interfaces/quest.interface';

// Sample quest data for demonstration
export const sampleQuests: Quest[] = [
  // Daily Quests
  {
    id: 'daily-1',
    title: 'Morning Avatar Check-in',
    description: 'Visit your avatar profile and check your daily status',
    type: 'daily' as QuestType,
    status: 'available' as QuestStatus,
    progress: 0,
    maxProgress: 1,
    rewards: [
      { type: 'xp', amount: 100, description: '100 XP for daily engagement' },
      { type: 'tokens', amount: 10, description: '10 Citizen Tokens' }
    ],
    requirements: [],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    createdAt: new Date(),
    category: 'social',
    difficulty: 'easy' as QuestDifficulty,
    xpReward: 100,
    tags: ['daily', 'social', 'engagement']
  },
  {
    id: 'daily-2',
    title: 'Connect with 3 Citizens',
    description: 'Interact with at least 3 other citizens in the community',
    type: 'daily' as QuestType,
    status: 'in_progress' as QuestStatus,
    progress: 1,
    maxProgress: 3,
    rewards: [
      { type: 'xp', amount: 150, description: '150 XP for community engagement' },
      { type: 'badge', amount: 1, description: 'Social Butterfly Badge' }
    ],
    requirements: [],
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // Expires in 18 hours
    createdAt: new Date(),
    category: 'social',
    difficulty: 'easy' as QuestDifficulty,
    xpReward: 150,
    tags: ['daily', 'social', 'community']
  },
  {
    id: 'daily-3',
    title: 'Avatar Customization',
    description: 'Make at least one change to your avatar appearance',
    type: 'daily' as QuestType,
    status: 'completed' as QuestStatus,
    progress: 1,
    maxProgress: 1,
    rewards: [
      { type: 'xp', amount: 125, description: '125 XP for creativity' },
      { type: 'tokens', amount: 15, description: '15 Style Tokens' }
    ],
    requirements: [],
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    createdAt: new Date(),
    completedAt: new Date(),
    category: 'crafting',
    difficulty: 'easy' as QuestDifficulty,
    xpReward: 125,
    tags: ['daily', 'customization', 'creativity']
  },

  // Weekly Quests
  {
    id: 'weekly-1',
    title: 'Community Builder',
    description: 'Help 5 new citizens get started in the community',
    type: 'weekly' as QuestType,
    status: 'in_progress' as QuestStatus,
    progress: 2,
    maxProgress: 5,
    rewards: [
      { type: 'xp', amount: 500, description: '500 XP for mentorship' },
      { type: 'badge', amount: 1, description: 'Mentor Badge' },
      { type: 'tokens', amount: 100, description: '100 Community Tokens' }
    ],
    requirements: [
      { type: 'level', value: 5, description: 'Must be at least level 5' }
    ],
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Expires in 5 days
    createdAt: new Date(),
    category: 'social',
    difficulty: 'medium' as QuestDifficulty,
    xpReward: 500,
    tags: ['weekly', 'mentorship', 'community', 'social']
  },
  {
    id: 'weekly-2',
    title: 'Avatar Collection Master',
    description: 'Acquire 10 new avatar accessories or items',
    type: 'weekly' as QuestType,
    status: 'available' as QuestStatus,
    progress: 0,
    maxProgress: 10,
    rewards: [
      { type: 'xp', amount: 750, description: '750 XP for collecting' },
      { type: 'item', amount: 1, itemId: 'rare-accessory', description: 'Rare Avatar Accessory' },
      { type: 'tokens', amount: 200, description: '200 Collection Tokens' }
    ],
    requirements: [],
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    category: 'collection',
    difficulty: 'medium' as QuestDifficulty,
    xpReward: 750,
    tags: ['weekly', 'collection', 'items', 'accessories']
  },

  // Achievement Quests
  {
    id: 'achievement-1',
    title: 'First Steps',
    description: 'Complete your first 10 quests of any type',
    type: 'achievement' as QuestType,
    status: 'in_progress' as QuestStatus,
    progress: 7,
    maxProgress: 10,
    rewards: [
      { type: 'xp', amount: 1000, description: '1000 XP milestone reward' },
      { type: 'badge', amount: 1, description: 'Quest Newcomer Badge' },
      { type: 'title', amount: 1, description: 'Quest Initiate Title' }
    ],
    requirements: [],
    createdAt: new Date(),
    category: 'social',
    difficulty: 'easy' as QuestDifficulty,
    xpReward: 1000,
    tags: ['achievement', 'milestone', 'progression']
  },
  {
    id: 'achievement-2',
    title: 'Social Butterfly',
    description: 'Connect with 100 different citizens',
    type: 'achievement' as QuestType,
    status: 'available' as QuestStatus,
    progress: 0,
    maxProgress: 100,
    rewards: [
      { type: 'xp', amount: 2500, description: '2500 XP for social mastery' },
      { type: 'badge', amount: 1, description: 'Social Master Badge' },
      { type: 'tokens', amount: 500, description: '500 Social Tokens' }
    ],
    requirements: [
      { type: 'previous_quest', value: 'achievement-1', description: 'Complete First Steps achievement' }
    ],
    createdAt: new Date(),
    category: 'social',
    difficulty: 'hard' as QuestDifficulty,
    xpReward: 2500,
    tags: ['achievement', 'social', 'networking', 'mastery']
  },
  {
    id: 'achievement-3',
    title: 'Legendary Collector',
    description: 'Own 50 rare or legendary avatar items',
    type: 'achievement' as QuestType,
    status: 'locked' as QuestStatus,
    progress: 0,
    maxProgress: 50,
    rewards: [
      { type: 'xp', amount: 5000, description: '5000 XP for legendary status' },
      { type: 'badge', amount: 1, description: 'Legendary Collector Badge' },
      { type: 'item', amount: 1, itemId: 'legendary-crown', description: 'Exclusive Legendary Crown' }
    ],
    requirements: [
      { type: 'level', value: 25, description: 'Must be at least level 25' },
      { type: 'achievement', value: 'achievement-2', description: 'Complete Social Butterfly achievement' }
    ],
    createdAt: new Date(),
    category: 'collection',
    difficulty: 'legendary' as QuestDifficulty,
    xpReward: 5000,
    tags: ['achievement', 'legendary', 'collection', 'rare']
  },

  // Story Quests
  {
    id: 'story-1',
    title: 'Welcome to the Citizens Portal',
    description: 'Learn the basics of the Citizens Portal and complete your profile setup',
    type: 'story' as QuestType,
    status: 'completed' as QuestStatus,
    progress: 3,
    maxProgress: 3,
    rewards: [
      { type: 'xp', amount: 300, description: '300 XP for completing tutorial' },
      { type: 'tokens', amount: 50, description: '50 Welcome Tokens' }
    ],
    requirements: [],
    createdAt: new Date(),
    completedAt: new Date(),
    category: 'exploration',
    difficulty: 'easy' as QuestDifficulty,
    xpReward: 300,
    tags: ['story', 'tutorial', 'onboarding']
  },
  {
    id: 'story-2',
    title: 'The Avatar Council',
    description: 'Meet the Avatar Council members and learn about community governance',
    type: 'story' as QuestType,
    status: 'available' as QuestStatus,
    progress: 0,
    maxProgress: 5,
    rewards: [
      { type: 'xp', amount: 600, description: '600 XP for council introduction' },
      { type: 'badge', amount: 1, description: 'Council Member Badge' },
      { type: 'tokens', amount: 150, description: '150 Governance Tokens' }
    ],
    requirements: [
      { type: 'previous_quest', value: 'story-1', description: 'Complete Welcome to the Citizens Portal' }
    ],
    createdAt: new Date(),
    category: 'exploration',
    difficulty: 'medium' as QuestDifficulty,
    xpReward: 600,
    tags: ['story', 'governance', 'council', 'exploration']
  }
];

// Sample quest statistics
export const sampleQuestStats: QuestStats = {
  totalCompleted: 8,
  totalFailed: 2,
  dailyCompleted: 3,
  weeklyCompleted: 1,
  totalXpEarned: 3450,
  currentStreak: 5,
  longestStreak: 12,
  averageCompletionTime: 45,
  favoriteQuestType: 'daily' as QuestType,
  questsByType: {
    daily: 12,
    weekly: 4,
    achievement: 3,
    story: 2,
    event: 1
  },
  recentAchievements: [
    'First Steps - Complete your first 10 quests',
    'Social Connector - Connect with 25 citizens',
    'Daily Devotee - Complete 30 daily quests',
    'Style Master - Customize avatar 50 times'
  ]
};

// Utility functions for quest data manipulation
export const getQuestsByType = (quests: Quest[], type: QuestType): Quest[] => {
  return quests.filter(quest => quest.type === type);
};

export const getQuestsByStatus = (quests: Quest[], status: QuestStatus): Quest[] => {
  return quests.filter(quest => quest.status === status);
};

export const getQuestsByDifficulty = (quests: Quest[], difficulty: QuestDifficulty): Quest[] => {
  return quests.filter(quest => quest.difficulty === difficulty);
};

export const getAvailableQuests = (quests: Quest[]): Quest[] => {
  return quests.filter(quest => quest.status === 'available');
};

export const getActiveQuests = (quests: Quest[]): Quest[] => {
  return quests.filter(quest => quest.status === 'in_progress');
};

export const getCompletedQuests = (quests: Quest[]): Quest[] => {
  return quests.filter(quest => quest.status === 'completed');
};

export const calculateQuestProgress = (quest: Quest): number => {
  if (quest.maxProgress === 0) return 0;
  return Math.min((quest.progress / quest.maxProgress) * 100, 100);
};

export const isQuestExpired = (quest: Quest): boolean => {
  if (!quest.expiresAt) return false;
  return new Date() > new Date(quest.expiresAt);
};

export const getQuestTimeRemaining = (quest: Quest): string => {
  if (!quest.expiresAt) return 'No deadline';
  
  const now = new Date();
  const expiry = new Date(quest.expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
