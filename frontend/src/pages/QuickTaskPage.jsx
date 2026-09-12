import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Sparkles, ArrowRight, Timer, CheckCircle2, BookOpen, Palette, Code, Users, ChevronRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchExplanation from '../components/common/MatchExplanation';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useI18n } from '../i18n/index.jsx';

const TIME_OPTIONS = [
  { label: '5 min', value: 5, emoji: '⚡' },
  { label: '10 min', value: 10, emoji: '🌀' },
  { label: '15 min', value: 15, emoji: '⏱️' },
  { label: '30 min', value: 30, emoji: '🕐' },
  { label: '1 hour', value: 60, emoji: '🕐' },
];

const categoryIcon = (cat) => {
  const map = { Education: BookOpen, Technology: Code, Design: Palette, Community: Users };
  const Icon = map[cat] || Sparkles;
  return <Icon className="w-3.5 h-3.5" />;
};

const diffColor = (d) =>
  d === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
  d === 'Intermediate' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
  'text-red-400 bg-red-500/10 border-red-500/30';

export default function QuickTaskPage() {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedMins, setSelectedMins] = useState(null);
  const [customMins, setCustomMins] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const effectiveMins = selectedMins || (customMins ? Number(customMins) : null);

  const fetchTasks = async (mins) => {
    if (!mins || mins < 1) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/matches/quick?minutes=${mins}`);
      setTasks(res.data.matches || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (val) => {
    setSelectedMins(val);
    setCustomMins('');
    fetchTasks(val);
  };

  const handleCustom = () => {
    const v = Number(customMins);
    if (v > 0) { setSelectedMins(null); fetchTasks(v); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold mb-6">
              <Zap className="w-4 h-4 fill-emerald-400" />
              Signature Feature
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 leading-tight">
              ⏱️ {t('quick.title')}
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              {t('quick.subtitle')}
            </p>
            {isAuthenticated && user && (
              <div className="mt-3 text-sm text-emerald-400 font-semibold">
                Matching against your skills: {(user.skills || []).slice(0, 3).map(s => s.name || s).join(', ') || 'Update your profile to get better matches'}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-10">

        {/* Time Selector */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-center text-base font-bold text-slate-300 mb-5">{t('quick.selectTime')}</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`px-6 py-3 rounded-2xl font-extrabold text-sm border transition-all duration-200 ${
                  effectiveMins === opt.value
                    ? 'bg-emerald-500 border-emerald-400 text-white scale-105 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <input
              type="number"
              min="1"
              max="240"
              placeholder="Custom minutes..."
              value={customMins}
              onChange={(e) => { setCustomMins(e.target.value); setSelectedMins(null); }}
              className="w-40 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleCustom}
              disabled={!customMins || Number(customMins) < 1}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm transition-colors"
            >
              Find Tasks
            </button>
          </div>
        </motion.section>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-300 text-sm font-semibold">Finding perfect matches for your {effectiveMins} minutes…</span>
              </div>
            </motion.div>
          )}

          {!loading && searched && (
            <motion.section key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                    {t('quick.perfectMatches')}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    You have <span className="text-emerald-400 font-bold">{effectiveMins} minutes</span>
                    {tasks.length > 0 ? ` — ${tasks.length} tasks found` : ' — no tasks found right now'}
                  </p>
                </div>
                <Link to="/tasks" className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1">
                  Browse All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-slate-800 bg-slate-900/50">
                  <Timer className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold">No tasks available under {effectiveMins} minutes right now.</p>
                  <p className="text-slate-500 text-sm mt-1">Try a longer duration or check back soon!</p>
                  <Link to="/tasks" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold hover:bg-emerald-600/30 transition-colors">
                    Explore All Tasks <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tasks.map((task, i) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/40 transition-all duration-200 flex flex-col gap-3"
                    >
                      {/* Match score */}
                      <MatchExplanation
                        score={task.matchScore}
                        level={task.matchLevel}
                        reasons={task.matchReasons}
                        summary={task.matchSummary}
                        compact
                      />

                      {/* Task info */}
                      <div>
                        <h3 className="font-extrabold text-white text-sm leading-snug mb-1">{task.title}</h3>
                        <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-emerald-400">
                          <Clock className="w-3 h-3" /> {task.estimatedDuration} min
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300">
                          {categoryIcon(task.category)} {task.category}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${diffColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        {task.isBeginnerFriendly && (
                          <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[11px] font-bold text-teal-400">Beginner Friendly</span>
                        )}
                      </div>

                      {/* Required skills */}
                      {(task.requiredSkills || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.requiredSkills.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 border border-slate-700">{skill}</span>
                          ))}
                        </div>
                      )}

                      <Link
                        to={`/tasks/${task._id}`}
                        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Apply Now
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {!loading && !searched && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 text-slate-500">
              <Timer className="w-16 h-16 mx-auto mb-4 text-slate-700" />
              <p className="text-base font-semibold">Select how much time you have above</p>
              <p className="text-sm mt-1">We'll find tasks you can realistically complete right now</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!isAuthenticated && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
            <p className="text-emerald-300 font-semibold text-sm mb-2">
              🚀 Sign in to get AI-powered matches based on your skills & interests
            </p>
            <Link to="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors">
              Sign In for Better Matches <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
