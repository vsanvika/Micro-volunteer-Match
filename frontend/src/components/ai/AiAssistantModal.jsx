import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import TaskCard from '../tasks/TaskCard';

export default function AiAssistantModal({ onClose }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! 👋 I am your AI Micro-Volunteer Assistant. Tell me how much time you have or what skills you want to contribute, and I will recommend matching tasks!',
      tasks: [],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt;
    setPrompt('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/assistant', { prompt: userText });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.reply || 'Here are the recommended micro-tasks based on your request:',
          tasks: res.data.tasks || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I could not retrieve live recommendations right now, but feel free to explore tasks on the Discovery page!',
          tasks: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'I have 15 minutes and know Python',
    'Find quick education tasks',
    'I want to help with design or poster',
    'Quick 10-minute tasks right now',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-emerald-500/30 bg-slate-950 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Micro-Volunteer Assistant <Sparkles className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400">Ask questions or find tasks based on your time & skills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>

                {/* Embedded Recommended Tasks */}
                {m.tasks && m.tasks.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                    {m.tasks.map((t) => (
                      <TaskCard key={t._id} task={t} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
              <Bot className="w-4 h-4 animate-spin" /> AI is scanning open micro-tasks...
            </div>
          )}
        </div>

        {/* Preset Prompt Pills */}
        <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Try:</span>
          {samplePrompts.map((sp, i) => (
            <button
              key={i}
              onClick={() => setPrompt(sp)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 text-[11px] text-slate-300 whitespace-nowrap transition-colors border border-slate-700/50"
            >
              "{sp}"
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-800 flex items-center gap-2 bg-slate-950">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'I have 20 mins free and want to explain coding...'"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>

      </div>
    </div>
  );
}
