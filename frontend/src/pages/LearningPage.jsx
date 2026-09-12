import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ChevronRight, Target, Sparkles } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import { useI18n } from '../i18n/index.jsx';
import { Link } from 'react-router-dom';

export default function LearningPage() {
  const { t } = useI18n();
  const [learningGoals, setLearningGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsRes, recRes] = await Promise.all([
          api.get('/users/learning-goals'),
          api.get('/learning/recommendations'),
        ]);
        setLearningGoals(goalsRes.data.goals || []);
        setRecommendations(recRes.data.grouped ? Object.values(recRes.data.grouped).flat() : recRes.data.all || []);
      } catch {
        setLearningGoals([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addGoal = async () => {
    const skill = draft.trim();
    if (!skill) return;
    try {
      await api.put('/users/learning-goals', { skill, priority: 'Medium' });
      setLearningGoals(prev => [...prev, { skill, priority: 'Medium' }]);
      setDraft('');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-extrabold text-white mb-6 flex items-center gap-2">
          <Brain className="w-8 h-8 text-emerald-400" />
          {t('learn.title') || 'Learn Through Volunteering'}
        </h1>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-3xl bg-slate-900 animate-pulse" />)}
          </div>
        ) : (
          <>
            <section className="mb-10 glass-panel rounded-3xl border border-slate-800 p-6">
              <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4">{t('learn.wantToLearn') || 'Skills I Want to Improve'}</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {learningGoals.length > 0 ? learningGoals.map((g, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-emerald-800/50 text-emerald-300 text-xs border border-emerald-500/20">
                    {g.skill} ({g.priority || 'Medium'})
                  </span>
                )) : <span className="text-slate-500 text-sm">No learning goals yet.</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a skill like UI/UX or Python"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
                <button onClick={addGoal} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-sm font-bold hover:bg-emerald-500 transition">
                  Add Goal
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Practice Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recommendations.length > 0 ? recommendations.map((rec, i) => (
                  <motion.div key={rec._id || i} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800" whileHover={{ scale: 1.01 }}>
                    <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-bold uppercase">
                      <Target className="w-3.5 h-3.5" /> Skill Growth
                    </div>
                    <h3 className="font-bold text-white mb-2">{rec.title}</h3>
                    <p className="text-slate-400 text-sm">{rec.description}</p>
                    <Link to="/tasks" className="text-emerald-400 hover:underline mt-3 inline-block text-sm font-semibold">
                      Find tasks <ChevronRight className="inline w-3 h-3" />
                    </Link>
                  </motion.div>
                )) : (
                  <div className="md:col-span-2 text-center rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-slate-500">
                    No learning recommendations yet. Add a skill goal to start matching practice tasks.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
