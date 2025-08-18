import React from 'react';

interface QuestProgressProps {
  progress: number;
  maxProgress: number;
  title?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'purple';
  className?: string;
}

export default function QuestProgress({ 
  progress, 
  maxProgress, 
  title,
  showPercentage = true,
  size = 'md',
  color = 'blue',
  className = '' 
}: QuestProgressProps) {
  const percentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;
  const isCompleted = progress >= maxProgress;

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: isCompleted ? 'bg-green-500' : 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {(title || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {title && (
            <span className="text-sm font-medium text-white/80">{title}</span>
          )}
          {showPercentage && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">
                {progress}/{maxProgress}
              </span>
              <span className="text-sm font-medium text-white/80">
                {Math.round(percentage)}%
              </span>
              {isCompleted && (
                <span className="text-green-400 text-sm">✓</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div className={`w-full bg-black/30 border border-white/10 rounded-full ${sizeClasses[size]}`}>
          <div 
            className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            {/* Shimmer effect for active progress */}
            {!isCompleted && percentage > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
            )}
          </div>
        </div>

        {/* Completion glow effect */}
        {isCompleted && (
          <div className={`absolute inset-0 bg-green-400/30 ${sizeClasses[size]} rounded-full animate-pulse`} />
        )}
      </div>

      {/* Milestone markers */}
      {maxProgress > 1 && size !== 'sm' && (
        <div className="flex justify-between mt-1">
          {Array.from({ length: Math.min(maxProgress, 10) }, (_, i) => {
            const milestoneProgress = i + 1;
            const isReached = progress >= milestoneProgress;
            return (
              <div 
                key={i}
                className={`w-1 h-2 rounded-full transition-colors duration-300 ${
                  isReached ? colorClasses[color] : 'bg-white/20'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
