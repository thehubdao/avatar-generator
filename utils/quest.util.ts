import { Quest, QuestStats } from '../interfaces/quest.interface';
import { QuestSortType } from '../types/quest.type';
import { LogError } from './common.util';
import { Module } from '../enums/common.enum';

export class QuestService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  static async getAvailableQuests(userAddress?: string): Promise<{ success: boolean; quests?: Quest[]; error?: string }> {
    try {
      const url = userAddress 
        ? `${this.baseUrl}/api/quests/available?userAddress=${userAddress}`
        : `${this.baseUrl}/api/quests/available`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, quests: data.quests };
    } catch (error) {
      LogError(Module.Citizens, 'Failed to fetch available quests', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  static async getUserQuests(userAddress: string): Promise<{ success: boolean; quests?: Quest[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quests/user/${userAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, quests: data.quests };
    } catch (error) {
      LogError(Module.Citizens, 'Failed to fetch user quests', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  static async acceptQuest(questId: string, userAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quests/${questId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      LogError(Module.Citizens, 'Failed to accept quest', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  static async updateQuestProgress(questId: string, userAddress: string, progress: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quests/${questId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress, progress }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      LogError(Module.Citizens, 'Failed to update quest progress', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  static async completeQuest(questId: string, userAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      LogError(Module.Citizens, 'Failed to complete quest', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  static async getQuestStats(userAddress: string): Promise<{ success: boolean; stats?: QuestStats; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quests/stats/${userAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, stats: data.stats };
    } catch (error) {
      LogError(Module.Citizens, 'Failed to fetch quest stats', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Quest filtering utilities
  static filterQuests(quests: Quest[], filters: Record<string, any>): Quest[] {
    return quests.filter(quest => {
      // Type filter
      if (filters.type && filters.type !== 'all' && quest.type !== filters.type) {
        return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'all' && quest.status !== filters.status) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty && filters.difficulty !== 'all' && quest.difficulty !== filters.difficulty) {
        return false;
      }

      // Search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        return quest.title.toLowerCase().includes(searchTerm) ||
               quest.description.toLowerCase().includes(searchTerm) ||
               quest.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      }

      return true;
    });
  }

  static sortQuests(quests: Quest[], sort: QuestSortType): Quest[] {
    switch (sort) {
      case 'newest':
        return [...quests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return [...quests].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'difficulty': {
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'legendary': 4 };
        return [...quests].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      }
      case 'rewards':
        return [...quests].sort((a, b) => b.xpReward - a.xpReward);
      case 'expiry':
        return [...quests].sort((a, b) => {
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        });
      default:
        return quests;
    }
  }
}