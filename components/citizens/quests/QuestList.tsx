import React, { useState } from 'react';
import { Quest } from '../../../interfaces/quest.interface';
import QuestCard from './QuestCard';
import { QuestService } from '../../../utils/quest.util';
import { QuestFilterType, QuestSortType } from '../../../types/quest.type';
import AGText from '../../../ui/common/ag-text.component';
import AGButton from '../../../ui/common/ag-button.component';

interface QuestListProps {
  quests: Quest[];
  onAccept?: (questId: string) => void;
  onView?: (quest: Quest) => void;
  title?: string;
  emptyMessage?: string;
  showFilters?: boolean;
  className?: string;
}

export default function QuestList({ 
  quests, 
  onAccept, 
  onView, 
  title, 
  emptyMessage = "No quests available",
  showFilters = true,
  className = '' 
}: QuestListProps) {
  const [filter, setFilter] = useState<QuestFilterType>('all');
  const [sort, setSort] = useState<QuestSortType>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedQuests = React.useMemo(() => {
    const filterObj = { type: filter };
    let result = QuestService.filterQuests(quests, filterObj);
    
    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter(quest => 
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return QuestService.sortQuests(result, sort);
  }, [quests, filter, sort, searchTerm]);

  const filterOptions = [
    { value: 'all', label: 'All Quests' },
    { value: 'available', label: 'Available' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'difficulty', label: 'By Difficulty' },
    { value: 'rewards', label: 'By Rewards' },
    { value: 'expiry', label: 'By Expiry' },
  ];

  return (
    <div className={`relative w-full max-w-4xl mx-auto bg-gradient-to-b from-[#151515] to-[#0C0C0C] rounded-3xl border border-white/10 shadow-2xl ${className}`}>
      {/* Modal Content - Exact Campaign Modal Structure */}
      <div className="p-8 pt-12">
        {/* Header with Exact Campaign Modal Styling */}
        {title && (
          <div className="text-center mb-8">
            <h2 className="font-monument text-3xl md:text-5xl text-white mb-4">
              {title.toUpperCase()}
            </h2>
            <p className="text-white/70 text-lg">
              Select quests to embark on your adventure
            </p>
          </div>
        )}

        {/* Filters and Search with Exact Campaign Modal Design */}
        {showFilters && (
          <div className="mb-8 space-y-6">
            {/* Search Bar with Campaign Modal Styling */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search quests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm focus:outline-none focus:border-white/40 text-white placeholder-white/60 transition-all duration-300 hover:border-white/30"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter and Sort Controls with Campaign Modal Styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 text-lg font-medium mb-3">Filter</label>
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as QuestFilterType)}
                    className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm focus:outline-none focus:border-white/40 text-white transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
                  >
                    {filterOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-[#151515] text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-lg font-medium mb-3">Sort</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as QuestSortType)}
                    className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm focus:outline-none focus:border-white/40 text-white transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-[#151515] text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quest Count with Campaign Modal Style */}
        <div className="mb-6">
          <p className="text-white/70 text-lg">
            Showing {filteredAndSortedQuests.length} of {quests.length} quest{quests.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Quest Grid - Exact Campaign Modal Grid Layout */}
        {filteredAndSortedQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
            {filteredAndSortedQuests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onAccept={onAccept}
                onView={onView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-white/40 text-8xl mb-6">📋</div>
            <h3 className="font-monument text-2xl text-white mb-4">{emptyMessage.toUpperCase()}</h3>
            <p className="text-white/70 text-lg max-w-md mx-auto">
              {searchTerm.trim() 
                ? `No quests match your search "${searchTerm}"` 
                : "Check back later for new adventures!"
              }
            </p>
          </div>
        )}

        {/* Footer with Campaign Modal Style */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            Each quest offers unique rewards and experiences
          </p>
        </div>
      </div>
    </div>
  );
}
