import React from 'react';
import { QuestReward } from '../../../interfaces/quest.interface';

interface QuestRewardsProps {
  rewards: QuestReward[];
  xpReward: number;
  claimed?: boolean;
  onClaim?: () => void;
  className?: string;
}

export default function QuestRewards({ 
  rewards, 
  xpReward, 
  claimed = false, 
  onClaim, 
  className = '' 
}: QuestRewardsProps) {
  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'xp': return '⭐';
      case 'tokens': return '🪙';
      case 'badge': return '🏆';
      case 'item': return '🎁';
      case 'title': return '👑';
      default: return '🎁';
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'xp': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'tokens': return 'text-green-600 bg-green-100 border-green-200';
      case 'badge': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'item': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'title': return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const allRewards = [
    {
      type: 'xp',
      amount: xpReward,
      description: 'Experience Points'
    },
    ...rewards
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-3">
        {allRewards.map((reward, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
              claimed 
                ? 'bg-gray-50 border-gray-200 opacity-75' 
                : getRewardColor(reward.type)
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label={reward.type}>
                {getRewardIcon(reward.type)}
              </span>
              <div>
                <div className="font-medium text-gray-800">
                  {reward.description}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {reward.type} Reward
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-lg">
                {reward.amount}
                {reward.type === 'xp' && ' XP'}
                {reward.type === 'tokens' && ' 🪙'}
              </div>
              {claimed && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ Claimed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Claim Button */}
      {!claimed && onClaim && (
        <div className="mt-6">
          <button
            onClick={onClaim}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🎁</span>
              <span>Claim Rewards</span>
            </div>
          </button>
        </div>
      )}

      {/* Claimed State */}
      {claimed && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
            <span className="text-lg">✅</span>
            <span className="font-medium">Rewards Claimed!</span>
          </div>
        </div>
      )}
    </div>
  );
}
