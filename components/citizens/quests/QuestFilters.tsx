import React, { useState } from 'react';
import { QuestType, QuestDifficulty, QuestStatus } from '../../../interfaces/quest.interface';

interface QuestFiltersProps {
  filters: {
    search: string;
    type: QuestType | 'all';
    difficulty: QuestDifficulty | 'all';
    status: QuestStatus | 'all';
    sortBy: 'title' | 'difficulty' | 'xpReward' | 'deadline' | 'progress';
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (filters: any) => void;
  className?: string;
}

export default function QuestFilters({ filters, onFiltersChange, className = '' }: QuestFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      difficulty: 'all',
      status: 'all', 
      sortBy: 'title',
      sortOrder: 'asc'
    });
  };

  const hasActiveFilters = () => {
    return filters.search !== '' || 
           filters.type !== 'all' || 
           filters.difficulty !== 'all' || 
           filters.status !== 'all' ||
           filters.sortBy !== 'title' ||
           filters.sortOrder !== 'asc';
  };

  return (
    <div className={`relative w-full bg-gradient-to-b from-[#151515] to-[#0C0C0C] rounded-3xl border border-white/10 shadow-2xl ${className}`}>
      {/* Modal Content - Exact Campaign Modal Structure */}
      <div className="p-8">
        {/* Title with Campaign Modal Styling */}
        <div className="text-center mb-8">
          <h2 className="font-monument text-2xl md:text-3xl text-white mb-4">
            QUEST FILTERS
          </h2>
          <p className="text-white/70 text-lg">
            Customize your quest discovery experience
          </p>
        </div>

        {/* Search Bar with Campaign Modal Styling */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search quests..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-12 pr-16 py-4 bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm focus:outline-none focus:border-white/40 text-white placeholder-white/60 transition-all duration-300 hover:border-white/30"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Quick Status Filters with Campaign Modal Button Styling */}
        <div className="mb-8">
          <h3 className="text-white/80 text-lg font-medium mb-4">Quick Filters</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => updateFilter('status', filters.status === 'available' ? 'all' : 'available')}
              className={`
                relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 px-6 py-3
                ${filters.status === 'available' 
                  ? 'border-white/40 bg-white/10 text-white' 
                  : 'border-white/20 bg-black/30 text-white/70 hover:border-white/30 hover:bg-white/5'
                }
              `}
            >
              <span className="font-medium">Available</span>
              {filters.status === 'available' && (
                <div className="absolute inset-0 bg-white/5 opacity-100"></div>
              )}
            </button>
            <button
              onClick={() => updateFilter('status', filters.status === 'in_progress' ? 'all' : 'in_progress')}
              className={`
                relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 px-6 py-3
                ${filters.status === 'in_progress' 
                  ? 'border-white/40 bg-white/10 text-white' 
                  : 'border-white/20 bg-black/30 text-white/70 hover:border-white/30 hover:bg-white/5'
                }
              `}
            >
              <span className="font-medium">In Progress</span>
              {filters.status === 'in_progress' && (
                <div className="absolute inset-0 bg-white/5 opacity-100"></div>
              )}
            </button>
            <button
              onClick={() => updateFilter('status', filters.status === 'completed' ? 'all' : 'completed')}
              className={`
                relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 px-6 py-3
                ${filters.status === 'completed' 
                  ? 'border-white/40 bg-white/10 text-white' 
                  : 'border-white/20 bg-black/30 text-white/70 hover:border-white/30 hover:bg-white/5'
                }
              `}
            >
              <span className="font-medium">Completed</span>
              {filters.status === 'completed' && (
                <div className="absolute inset-0 bg-white/5 opacity-100"></div>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters Toggle with Campaign Modal Styling */}
        <div className="mb-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-white/80 hover:text-white transition-colors duration-300 group"
          >
            <span className="text-lg font-medium">Advanced Filters</span>
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Advanced Filters Panel with Campaign Modal Design */}
        {isExpanded && (
          <div className="border-t border-white/10 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Quest Type Filter */}
              <div>
                <label className="block text-white/80 text-lg font-medium mb-3">
                  Quest Type
                </label>
                <div className="relative">
                  <select
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                    className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm focus:outline-none focus:border-white/40 text-white transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#151515] text-white">All Types</option>
                    <option value="daily" className="bg-[#151515] text-white">Daily</option>
                    <option value="weekly" className="bg-[#151515] text-white">Weekly</option>
                    <option value="monthly" className="bg-[#151515] text-white">Monthly</option>
                    <option value="achievement" className="bg-[#151515] text-white">Achievement</option>
                    <option value="story" className="bg-[#151515] text-white">Story</option>
                    <option value="side" className="bg-[#151515] text-white">Side Quest</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-white/80 text-lg font-medium mb-3">
                  Difficulty
                </label>
                <div className="relative">
                  <select
                    value={filters.difficulty}
                    onChange={(e) => updateFilter('difficulty', e.target.value)}
                    className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm focus:outline-none focus:border-white/40 text-white transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#151515] text-white">All Difficulties</option>
                    <option value="easy" className="bg-[#151515] text-white">Easy</option>
                    <option value="medium" className="bg-[#151515] text-white">Medium</option>
                    <option value="hard" className="bg-[#151515] text-white">Hard</option>
                    <option value="legendary" className="bg-[#151515] text-white">Legendary</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-white/80 text-lg font-medium mb-3">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm focus:outline-none focus:border-white/40 text-white transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
                  >
                    <option value="title" className="bg-[#151515] text-white">Title</option>
                    <option value="difficulty" className="bg-[#151515] text-white">Difficulty</option>
                    <option value="xpReward" className="bg-[#151515] text-white">XP Reward</option>
                    <option value="deadline" className="bg-[#151515] text-white">Deadline</option>
                    <option value="progress" className="bg-[#151515] text-white">Progress</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-white/80 text-lg font-medium mb-3">
                  Sort Order
                </label>
                <div className="relative">
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => updateFilter('sortOrder', e.target.value)}
                    className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm focus:outline-none focus:border-white/40 text-white transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
                  >
                    <option value="asc" className="bg-[#151515] text-white">Ascending</option>
                    <option value="desc" className="bg-[#151515] text-white">Descending</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters Button with Campaign Modal Styling */}
            {hasActiveFilters() && (
              <div className="text-center">
                <button
                  onClick={clearFilters}
                  className="relative group cursor-pointer rounded-2xl overflow-hidden border-2 border-white/20 bg-black/30 hover:border-white/30 hover:bg-white/5 transition-all duration-300 px-8 py-3"
                >
                  <span className="text-white/80 hover:text-white font-medium">Clear All Filters</span>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer with Campaign Modal Style */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            Use filters to find quests that match your preferences and playstyle
          </p>
        </div>
      </div>
    </div>
  );
}
