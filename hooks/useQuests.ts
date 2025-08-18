import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setLoading, 
  setError, 
  setQuests, 
  acceptQuest as acceptQuestAction, 
  updateQuestProgress as updateQuestProgressAction,
  completeQuest as completeQuestAction,
  updateQuestStats
} from '../store/questSlice';
import { QuestService } from '../utils/quest.util';
import { Quest } from '../interfaces/quest.interface';
import { LogError } from '../utils/common.util';
import { Module } from '../enums/common.enum';

export const useQuests = () => {
  const dispatch = useAppDispatch();
  const walletAddress = useAppSelector(state => state.citizensAuth.address);
  const questState = useAppSelector(state => state.quest);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchQuests = useCallback(async () => {
    if (!walletAddress) return;

    // Defer state updates to avoid render-time updates
    setTimeout(() => {
      dispatch(setLoading(true));
      dispatch(setError(null));
    }, 0);

    try {
      const [availableResult, userResult, statsResult] = await Promise.all([
        QuestService.getAvailableQuests(walletAddress),
        QuestService.getUserQuests(walletAddress),
        QuestService.getQuestStats(walletAddress)
      ]);

      // Defer all dispatch calls to avoid render-time updates
      setTimeout(() => {
        if (availableResult.success && userResult.success) {
          const allQuests = [...(availableResult.quests || []), ...(userResult.quests || [])];
          // Remove duplicates based on quest ID
          const uniqueQuests = allQuests.filter((quest, index, self) => 
            index === self.findIndex(q => q.id === quest.id)
          );
          dispatch(setQuests(uniqueQuests));
        } else {
          // Fallback to sample data if API fails
          LogError(Module.Citizens, 'API failed, loading sample quest data');
          const { sampleQuests, sampleQuestStats } = require('../utils/sampleQuestData');
          dispatch(setQuests(sampleQuests));
          dispatch(updateQuestStats(sampleQuestStats));
        }

        if (statsResult.success && statsResult.stats) {
          dispatch(updateQuestStats(statsResult.stats));
        } else if (!availableResult.success || !userResult.success) {
          // Only set sample stats if we're in fallback mode
          const { sampleQuestStats } = require('../utils/sampleQuestData');
          dispatch(updateQuestStats(sampleQuestStats));
        }
        
        dispatch(setLoading(false));
      }, 0);
    } catch (error) {
      LogError(Module.Citizens, 'Error fetching quests, loading sample data', error);
      setTimeout(() => {
        // Load sample data as fallback
        try {
          const { sampleQuests, sampleQuestStats } = require('../utils/sampleQuestData');
          dispatch(setQuests(sampleQuests));
          dispatch(updateQuestStats(sampleQuestStats));
        } catch (fallbackError) {
          LogError(Module.Citizens, 'Failed to load sample data', fallbackError);
          dispatch(setError('Failed to load quests'));
        }
        dispatch(setLoading(false));
      }, 0);
    }
  }, [walletAddress, dispatch]);

  const acceptQuest = useCallback(async (questId: string) => {
    if (!walletAddress) return;

    try {
      const result = await QuestService.acceptQuest(questId, walletAddress);
      if (result.success) {
        dispatch(acceptQuestAction(questId));
      } else {
        dispatch(setError(result.error || 'Failed to accept quest'));
      }
    } catch (error) {
      LogError(Module.Citizens, 'Error accepting quest', error);
      dispatch(setError('Failed to accept quest'));
    }
  }, [walletAddress, dispatch]);

  const updateQuestProgress = useCallback(async (questId: string, progress: number) => {
    if (!walletAddress) return;

    try {
      const result = await QuestService.updateQuestProgress(questId, walletAddress, progress);
      if (result.success) {
        dispatch(updateQuestProgressAction({ questId, progress }));
      } else {
        dispatch(setError(result.error || 'Failed to update quest progress'));
      }
    } catch (error) {
      LogError(Module.Citizens, 'Error updating quest progress', error);
      dispatch(setError('Failed to update quest progress'));
    }
  }, [walletAddress, dispatch]);

  const completeQuest = useCallback(async (questId: string) => {
    if (!walletAddress) return;

    try {
      const result = await QuestService.completeQuest(questId, walletAddress);
      if (result.success) {
        dispatch(completeQuestAction(questId));
      } else {
        dispatch(setError(result.error || 'Failed to complete quest'));
      }
    } catch (error) {
      LogError(Module.Citizens, 'Error completing quest', error);
      dispatch(setError('Failed to complete quest'));
    }
  }, [walletAddress, dispatch]);

  const refreshQuests = useCallback(() => {
    fetchQuests();
  }, [fetchQuests]);

  // Initialize hook after first render to avoid render-time state updates
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (walletAddress && isInitialized) {
      fetchQuests();
    }
  }, [walletAddress, isInitialized, fetchQuests]);

  return {
    ...questState,
    acceptQuest,
    updateQuestProgress,
    completeQuest,
    refreshQuests,
  };
};

export const useQuestProgress = (questId: string) => {
  const dispatch = useAppDispatch();
  const walletAddress = useAppSelector(state => state.citizensAuth.address);
  const quest = useAppSelector(state => 
    state.quest.quests.find(q => q.id === questId)
  );

  const updateProgress = useCallback(async (progress: number) => {
    if (!walletAddress || !quest) return;

    try {
      const result = await QuestService.updateQuestProgress(questId, walletAddress, progress);
      if (result.success) {
        dispatch(updateQuestProgressAction({ questId, progress }));
      } else {
        dispatch(setError(result.error || 'Failed to update progress'));
      }
    } catch (error) {
      LogError(Module.Citizens, 'Error updating quest progress', error);
      dispatch(setError('Failed to update progress'));
    }
  }, [questId, walletAddress, quest, dispatch]);

  const incrementProgress = useCallback(async (amount: number = 1) => {
    if (!quest) return;
    
    const newProgress = Math.min(quest.progress + amount, quest.maxProgress);
    await updateProgress(newProgress);
  }, [quest, updateProgress]);

  return {
    quest,
    progress: quest?.progress || 0,
    maxProgress: quest?.maxProgress || 0,
    percentage: quest ? (quest.progress / quest.maxProgress) * 100 : 0,
    isCompleted: quest?.status === 'completed',
    updateProgress,
    incrementProgress,
  };
};
