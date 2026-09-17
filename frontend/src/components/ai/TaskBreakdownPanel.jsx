import React, { useState } from 'react';
import { CheckCircle2, ListChecks, Loader2, Sparkles } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function TaskBreakdownPanel({ title, description, duration }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateBreakdown = async () => {
    if (!title || !description) {
      toast.error('Add a title and description first');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/ai/task-breakdown', { title, description, duration });
      setBreakdown(response.data.breakdown);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create task steps');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><ListChecks className="w-4 h-4 text-sky-400" /> AI task breakdown</h3>
          <p className="text-[11px] text-slate-400 mt-1">Turn the request into steps a volunteer can finish.</p>
        </div>
        <button type="button" onClick={generateBreakdown} disabled={loading} className="px-3 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </button>
      </div>
      {breakdown && (
        <div className="space-y-2">
          {breakdown.steps.map((step, index) => (
            <div key={`${step.title}-${index}`} className="flex gap-3 rounded-xl bg-slate-900/80 p-3">
              <CheckCircle2 className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
              <div className="min-w-0"><p className="text-xs font-bold text-white">{index + 1}. {step.title} <span className="text-sky-300">· {step.minutes} min</span></p><p className="text-[11px] text-slate-400 mt-1">{step.outcome}</p></div>
            </div>
          ))}
          <p className="text-[11px] text-slate-300"><span className="font-bold text-sky-300">Success signal:</span> {breakdown.successSignal}</p>
        </div>
      )}
    </div>
  );
}
