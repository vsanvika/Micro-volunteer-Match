import React, { useState } from 'react';
import { Sparkles, Wand2, X, Check, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SmartTaskCreatorModal({ onClose, onApplySuggestions }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.post('/ai/smart-task-creator', { prompt });
      setSuggestions(res.data.suggestions);
      toast.success('AI suggestions generated!');
    } catch (err) {
      toast.error('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestions = () => {
    if (suggestions) {
      onApplySuggestions(suggestions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Smart AI Task Creator <Sparkles className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400">Describe what you need in plain English</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!suggestions ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                What do you need help with?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Need someone to explain Java loops to junior students for 10 minutes..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Wand2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'AI is structuring task...' : 'Generate Form Suggestions'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/30 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 font-bold">Suggested Title:</span>
                <p className="text-white font-bold text-sm mt-0.5">{suggestions.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 font-bold">Category:</span>
                  <p className="text-emerald-400 font-bold">{suggestions.category}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Duration:</span>
                  <p className="text-emerald-400 font-bold">{suggestions.estimatedDuration} Minutes</p>
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Required Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {suggestions.requiredSkills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-200">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Description:</span>
                <p className="text-slate-300 mt-1">{suggestions.description}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSuggestions(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Try Another Prompt
              </button>
              <button
                onClick={handleUseSuggestions}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" /> Apply to Form
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
