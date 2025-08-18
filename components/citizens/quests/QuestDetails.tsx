import React from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import { formatDistanceToNow } from 'date-fns';

interface QuestDetailsProps {
  quest: Quest;
  onClose: () => void;
  onAccept?: (questId: string) => void;
  onComplete?: (questId: string) => void;
  className?: string;
}

export default function QuestDetails({ 
  quest, 
  onClose, 
  onAccept, 
  onComplete, 
  className = '' 
}: QuestDetailsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'hard': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'legendary': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getProgressPercentage = () => {
    return quest.maxProgress > 0 ? (quest.progress / quest.maxProgress) * 100 : 0;
  };

  const isExpiringSoon = () => {
    if (!quest.expiresAt) return false;
    const now = new Date();
    const expiryTime = new Date(quest.expiresAt);
    const hoursUntilExpiry = (expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{quest.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(quest.difficulty)}`}>
                  {quest.difficulty.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${quest.status === 'available' ? 'text-blue-600 bg-blue-100 border-blue-200' :
                    quest.status === 'in_progress' ? 'text-yellow-600 bg-yellow-100 border-yellow-200' :
                    quest.status === 'completed' ? 'text-green-600 bg-green-100 border-green-200' :
                    'text-gray-600 bg-gray-100 border-gray-200'} border`}>
                  {quest.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border
                  ${quest.type === 'daily' ? 'text-blue-600 bg-blue-100 border-blue-200' :
                    quest.type === 'weekly' ? 'text-indigo-600 bg-indigo-100 border-indigo-200' :
                    quest.type === 'achievement' ? 'text-purple-600 bg-purple-100 border-purple-200' :
                    'text-gray-600 bg-gray-100 border-gray-200'}`}>
                  {quest.type.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{quest.description}</p>
          </div>

          {/* Progress */}
          {quest.status === 'in_progress' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Progress</span>
                  <span className="text-sm font-medium text-gray-800">
                    {quest.progress}/{quest.maxProgress} ({Math.round(getProgressPercentage())}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rewards */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Rewards</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-xl">⭐</span>
                  <span className="font-medium text-gray-800">Experience Points</span>
                </div>
                <span className="font-bold text-yellow-600">{quest.xpReward} XP</span>
              </div>
              
              {quest.rewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 text-xl">🎁</span>
                    <div>
                      <div className="font-medium text-gray-800">{reward.description}</div>
                      <div className="text-sm text-gray-600 capitalize">{reward.type}</div>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">{reward.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {quest.requirements && quest.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h3>
              <div className="space-y-2">
                {quest.requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-500 text-sm mt-0.5">•</span>
                    <div>
                      <div className="text-sm font-medium text-gray-800 capitalize">
                        {req.type.replace('_', ' ')}: {req.value}
                      </div>
                      <div className="text-sm text-gray-600">{req.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {quest.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {quest.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expiry Warning */}
          {isExpiringSoon() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-red-800">Quest Expiring Soon!</h4>
                  <p className="text-red-600 text-sm">
                    This quest expires {formatDistanceToNow(new Date(quest.expiresAt!))} from now
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-sm text-gray-500 space-y-1">
            <div>Created: {new Date(quest.createdAt).toLocaleDateString()}</div>
            {quest.completedAt && (
              <div>Completed: {new Date(quest.completedAt).toLocaleDateString()}</div>
            )}
            {quest.expiresAt && (
              <div>Expires: {new Date(quest.expiresAt).toLocaleDateString()}</div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex gap-3">
            {quest.status === 'available' && onAccept && (
              <button
                onClick={() => onAccept(quest.id)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Accept Quest
              </button>
            )}
            {quest.status === 'in_progress' && quest.progress >= quest.maxProgress && onComplete && (
              <button
                onClick={() => onComplete(quest.id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Complete Quest
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
