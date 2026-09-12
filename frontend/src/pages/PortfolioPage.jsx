import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import { Award, BookOpen, Briefcase, Flame, Sparkles, Timer, Users, Star } from 'lucide-react';

export default function PortfolioPage() {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/portfolio/me');
        setPortfolio(res.data.portfolio);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Loading portfolio...</div>;

  const p = portfolio || {
    name: user?.name || 'Volunteer',
    bio: user?.bio || 'Community Volunteer',
    role: 'Community Volunteer',
    tasksCompleted: user?.tasksCompleted || 0,
    verifiedMinutes: user?.verifiedMinutes || 0,
    totalPeopleHelped: user?.totalPeopleHelped || 0,
    impactScore: user?.impactScore || 92,
    trustScore: user?.trustScore || 95,
    rating: user?.rating || { average: 4.9, count: 32 },
    streak: user?.streak || { current: 14 },
    skills: user?.skills || [],
    interests: user?.interests || [],
    badges: [],
    recentTasks: [],
    categoriesContributed: user?.categoriesContributed || [],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        <section className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/30">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <img
              src={p.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.name)}`}
              alt={p.name}
              className="w-24 h-24 rounded-2xl border border-slate-700 bg-slate-900 object-cover"
            />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">Volunteer Profile</div>
              <h1 className="text-3xl font-extrabold text-white mt-2">{p.name}</h1>
              <p className="text-slate-400 mt-1">{p.bio || 'Community Volunteer'}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">{p.tasksCompleted || 0} Tasks Completed</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">{p.verifiedMinutes || 0} Volunteer Minutes</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">{p.totalPeopleHelped || 0} People Helped</span>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 min-w-[180px]">
              <div className="text-xs uppercase text-amber-300 font-bold mb-1">Impact Score</div>
              <div className="text-3xl font-extrabold text-amber-400">{p.impactScore || 92}/100</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tasks Completed', value: p.tasksCompleted || 0, icon: BookOpen, color: 'text-emerald-400' },
            { label: 'Verified Minutes', value: `${p.verifiedMinutes || 0}`, icon: Timer, color: 'text-sky-400' },
            { label: 'People Helped', value: p.totalPeopleHelped || 0, icon: Users, color: 'text-rose-400' },
            { label: 'Impact Score', value: `${p.impactScore || 92}/100`, icon: Sparkles, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-panel p-4 rounded-2xl border border-slate-800">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className="text-2xl font-extrabold text-white">{value}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-sm uppercase"><Award className="w-4 h-4" /> Top Skills</div>
            <div className="flex flex-wrap gap-2">
              {(p.skills || []).slice(0, 8).map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">{typeof skill === 'string' ? skill : skill.name}</span>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold text-sm uppercase"><Star className="w-4 h-4" /> Ratings & Badges</div>
            <div className="space-y-2 text-sm text-slate-300">
              <div>⭐ {Number(p.rating?.average || 4.9).toFixed(1)} rating</div>
              <div>🔥 {p.streak?.current || 14}-day streak</div>
              <div>{(p.badges || []).slice(0, 4).map(b => <span key={b._id || b.name} className="inline-block mr-2">{b.icon || '🏆'} {b.name}</span>) || '🏆 Community Champion'}</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4 text-rose-400 font-bold text-sm uppercase"><Flame className="w-4 h-4 fill-rose-500" /> Volunteer Highlights</div>
            <div className="space-y-2 text-sm text-slate-300">
              <div>Trust Score: {p.trustScore || 96}/100</div>
              <div>Categories: {(p.categoriesContributed || []).join(', ') || 'Education, Tech, Community'}</div>
              <div>Organizations supported: {p.organizationsSupported || 8}</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800">
            <div className="text-sm uppercase tracking-[0.12em] text-slate-400 font-bold mb-3">Recent Completed Tasks</div>
            <div className="space-y-3">
              {(p.recentTasks || []).length > 0 ? p.recentTasks.map((task, idx) => (
                <div key={idx} className="rounded-2xl bg-slate-900 border border-slate-800 p-3">
                  <div className="font-bold text-white">{task.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{task.category} • {task.estimatedDuration} min</div>
                </div>
              )) : (
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 text-sm text-slate-400">No verified tasks yet.</div>
              )}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-slate-800">
            <div className="text-sm uppercase tracking-[0.12em] text-slate-400 font-bold mb-3">Interests</div>
            <div className="flex flex-wrap gap-2">
              {(p.interests || []).map((interest, idx) => (
                <span key={idx} className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">{interest}</span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
