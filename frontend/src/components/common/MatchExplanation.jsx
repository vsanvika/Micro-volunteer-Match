import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const scoreColor = (score) => {
  if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', ring: 'from-emerald-500 to-teal-400' };
  if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', ring: 'from-amber-500 to-yellow-400' };
  return { text: 'text-slate-400', bg: 'bg-slate-700/40', border: 'border-slate-600/40', ring: 'from-slate-500 to-slate-400' };
};

const iconColor = (icon) => {
  if (icon === '✓') return 'text-emerald-400';
  if (icon === '⚠') return 'text-amber-400';
  if (icon === '✗') return 'text-red-400';
  if (icon === '🎯') return 'text-purple-400';
  return 'text-slate-400';
};

export default function MatchExplanation({ score, level, reasons = [], summary, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);
  if (!score) return null;

  const colors = scoreColor(score);
  const reasonList = Array.isArray(reasons) ? reasons : [];

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-3`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <div className={`text-xl font-extrabold ${colors.text}`}>{score}%</div>
          <div>
            <div className={`text-xs font-bold ${colors.text}`}>{level}</div>
            {compact && summary && (
              <div className="text-[10px] text-slate-500 truncate max-w-[160px]">{summary}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] text-slate-400 font-semibold">Why match?</span>
          {compact && (expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />)}
        </div>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5 border-t border-slate-700/50 pt-2">
          {summary && (
            <p className="text-[11px] text-slate-300 italic mb-1">{summary}</p>
          )}
          {reasonList.length > 0 ? reasonList.map((reason, i) => {
            const text = typeof reason === 'string' ? reason : reason.text;
            const icon = typeof reason === 'string' ? '✓' : reason.icon;
            return (
              <div key={i} className="flex items-start gap-1.5">
                <span className={`text-xs font-bold mt-0.5 ${iconColor(icon)}`}>{icon}</span>
                <span className="text-[11px] text-slate-300">{text}</span>
              </div>
            );
          }) : (
            <p className="text-[11px] text-slate-400">Good opportunity for your profile</p>
          )}
        </div>
      )}
    </div>
  );
}
