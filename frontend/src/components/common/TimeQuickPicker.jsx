import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';

export default function TimeQuickPicker() {
  const { selectedTimeMinutes, setSelectedTimeMinutes } = useTaskStore();

  const options = [
    { label: '5 Mins', value: 5 },
    { label: '10 Mins', value: 10 },
    { label: '15 Mins', value: 15 },
    { label: '30 Mins', value: 30 },
    { label: '45 Mins', value: 45 },
    { label: '1 Hour', value: 60 },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 fill-emerald-400" /> Time-Based Matching Engine
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            How much free time do you have right now?
          </h3>
        </div>
        <div className="text-xs text-slate-400">
          Showing tasks you can complete in <span className="text-emerald-400 font-bold">{selectedTimeMinutes} minutes</span> or less.
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedTimeMinutes === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setSelectedTimeMinutes(opt.value)}
              className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 border ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80'
              }`}
            >
              <Clock className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
