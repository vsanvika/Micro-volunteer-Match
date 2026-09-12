import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Sparkles, User, Tag, ArrowRight } from 'lucide-react';
import MatchBadge from '../common/MatchBadge';

export default function TaskCard({ task }) {
  if (!task) return null;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between h-full relative overflow-hidden group">
      
      {/* Top Banner & Match Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] font-bold text-slate-300 flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-400" />
            {task.category}
          </span>
          <MatchBadge score={task.matchScore || 80} level={task.matchLevel || 'Good Match'} showScoreOnly />
        </div>

        {/* Title & Description */}
        <Link to={`/tasks/${task._id}`} className="block group-hover:text-emerald-400 transition-colors">
          <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug">
            {task.title}
          </h3>
        </Link>
        
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>

        {/* Required Skills Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(task.requiredSkills || []).slice(0, 3).map((skill, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-300">
              {skill}
            </span>
          ))}
          {(task.requiredSkills || []).length > 3 && (
            <span className="text-[10px] text-slate-500 font-semibold self-center">
              +{(task.requiredSkills || []).length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Meta Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
        <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            {task.estimatedDuration} mins
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {task.locationMode === 'online' ? 'Online' : 'In-Person'}
          </span>
        </div>

        <Link
          to={`/tasks/${task._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group-hover:translate-x-0.5 transition-transform"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
