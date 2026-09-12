import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Trophy, CheckCircle2, Zap, Star, ChevronRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import { useI18n } from '../i18n/index.jsx';
import { Link } from 'react-router-dom';

const typeColors = {
  COMPLETE_TASKS: 'from-emerald-500 to-teal-500',
  VOLUNTEER_MINUTES: 'from-blue-500 to-cyan-500',
  HELP_STUDENTS: 'from-purple-500 to-violet-500',
  USE_SKILL: 'from-amber-500 to-yellow-500',
  CATEGORY_TASKS: 'from-pink-500 to-rose-500',
  STREAK: 'from-orange-500 to-red-500',
};

export default function ChallengesPage() {
  const { t } = useI18n();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allRes, progressRes] = await Promise.allSettled([
          api.get('/challenges'),
          api.get('/challenges/my-progress'),
        ]);
        const allChallenges = allRes.status === 'fulfilled' ? (allRes.value.data.challenges || []) : [];
        const progressList = progressRes.status === 'fulfilled' ? (progressRes.value.data.challenges || []) : [];

        const progressMap = {};
        progressList.forEach(c => { progressMap[c._id] = c; });

        const merged = allChallenges.map(c => ({
          ...c,
          userProgress: progressMap[c._id]?.userProgress || 0,
          completed: progressMap[c._id]?.completed || false,
        }));
        setChallenges(merged);
      } catch {
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const weekEnd = challenges[0]?.weekEnd ? new Date(challenges[0].weekEnd) : null;
  const daysLeft = weekEnd ? Math.max(0, Math.ceil((weekEnd - now) / (1000 * 60 * 60 * 24))) : null;

  const active = challenges.filter(c => !c.completed);
  const done = challenges.filter(c => c.completed);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Target className="w-8 h-8 text-emerald-400" /> {t('challenge.title')}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Complete challenges to earn bonus points and badges</p>
          </div>
          {daysLeft !== null && (
            <div className="text-right">
              <div className="text-2xl font-extrabold text-emerald-400">{daysLeft}</div>
              <div className="text-xs text-slate-500 font-semibold">days left this week</div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-3xl bg-slate-900 animate-pulse" />)}
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">No active challenges this week</p>
            <p className="text-sm mt-1">Check back Monday for new challenges!</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="mb-10">
                <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4">Active Challenges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {active.map((c, i) => {
                    const pct = Math.min(100, Math.round((c.userProgress / c.target) * 100));
                    const gradient = typeColors[c.type] || 'from-emerald-500 to-teal-500';
                    return (
                      <motion.div
                        key={c._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="text-3xl">{c.icon}</div>
                          <div className="text-right">
                            <div className="text-[11px] text-slate-500 font-semibold">Reward</div>
                            <div className="text-emerald-400 font-extrabold text-sm">+{c.rewardPoints} pts</div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-sm">{c.title}</h3>
                          <p className="text-slate-400 text-xs mt-0.5">{c.description}</p>
                        </div>
                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-slate-300">{c.userProgress} / {c.target}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 text-right">{pct}% complete</div>
                        </div>
                        <Link to="/tasks" className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                          Find tasks to complete this <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {done.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed This Week
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {done.map(c => (
                    <div key={c._id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
                      <div className="text-2xl">{c.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white">{c.title}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold">✓ Completed • +{c.rewardPoints} pts earned</div>
                      </div>
                      <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
