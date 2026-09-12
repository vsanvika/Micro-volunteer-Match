import React from 'react';
import { Search, Filter, Clock, MapPin, Tag, Sparkles } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';

export default function TaskFilter() {
  const { filters, setFilter } = useTaskStore();

  const categories = ['All', 'Education', 'Technology', 'Design', 'Translation', 'Community', 'Writing', 'Social Media', 'Donations'];
  const sortOptions = [
    { label: 'Best Match %', value: 'bestMatch' },
    { label: 'Shortest Time', value: 'shortest' },
    { label: 'Newest First', value: 'newest' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search micro-tasks by title, skill, or keyword..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Sort:</span>
          <select
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Tag className="w-3.5 h-3.5" /> Category:
        </span>
        {categories.map((cat) => {
          const active = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter('category', cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                active
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
