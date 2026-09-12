import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function MatchBadge({ score = 75, level = 'Good Match', showScoreOnly = false }) {
  let colorStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let glowStyle = 'shadow-emerald-500/10';

  if (score >= 80) {
    colorStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20';
  } else if (score >= 60) {
    colorStyle = 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sky-500/20';
  } else if (score >= 40) {
    colorStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-amber-500/20';
  } else {
    colorStyle = 'bg-slate-800 text-slate-400 border-slate-700';
  }

  if (showScoreOnly) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold shadow-sm ${colorStyle}`}>
        <Sparkles className="w-3 h-3" />
        {score}% Match
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold shadow-md ${colorStyle} ${glowStyle}`}>
      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
      <span>{score}% Match</span>
      <span className="text-[10px] opacity-75 font-normal">({level})</span>
    </div>
  );
}
