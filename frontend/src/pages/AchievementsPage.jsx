import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Award, 
  Star, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Medal,
  Clock
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';

export default function AchievementsPage() {
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    setLoading(true);
    try {
      const [badgesRes, leaderRes] = await Promise.all([
        api.get('/gamification/badges'),
        api.get('/leaderboard'),
      ]);
      setBadges(badgesRes.data.badges || []);
      setStats(badgesRes.data.stats || {});
      setLeaderboard(leaderRes.data.leaderboard || []);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-400" /> Badges & Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Track your volunteer progression, unlock achievement badges, and view top contributors.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="glass-panel p-3 px-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-xl font-extrabold text-amber-400">{stats.points || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Points</div>
            </div>
            <div className="glass-panel p-3 px-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-xl font-extrabold text-emerald-400">{stats.volunteerMinutes || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Volunteer Mins</div>
            </div>
            <div className="glass-panel p-3 px-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-xl font-extrabold text-rose-400 flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 fill-rose-500 text-rose-500" /> {stats.streak || 0}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Streak Days</div>
            </div>
          </div>
        </div>

        {/* Badges Grid Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /> Achievement Badges
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <div
                key={badge._id}
                className={`glass-panel p-4 rounded-2xl border text-center transition-all ${
                  badge.isUnlocked
                    ? 'border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="text-xs font-bold text-white mb-1">{badge.name}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mb-2">
                  {badge.description}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                  badge.isUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {badge.isUnlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard Table Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-400" /> Community Leaderboard Rankings
          </h2>

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Rank</th>
                    <th className="py-3.5 px-4">Volunteer</th>
                    <th className="py-3.5 px-4">Tasks Done</th>
                    <th className="py-3.5 px-4">Volunteer Time</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {leaderboard.map((user) => {
                    let rankBadge = `${user.rank}`;
                    if (user.rank === 1) rankBadge = '🥇 1st';
                    else if (user.rank === 2) rankBadge = '🥈 2nd';
                    else if (user.rank === 3) rankBadge = '🥉 3rd';

                    return (
                      <tr key={user._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-amber-400 text-sm">{rankBadge}</td>
                        <td className="py-3.5 px-4 flex items-center space-x-3">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-8 h-8 rounded-xl bg-slate-800 object-cover"
                          />
                          <div>
                            <div className="font-bold text-white">{user.name}</div>
                            <div className="text-[10px] text-slate-400">{user.bio || 'Student Volunteer'}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{user.tasksCompleted}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-400">{user.volunteerMinutes} mins</td>
                        <td className="py-3.5 px-4 font-semibold text-amber-400">
                          ⭐ {user.rating?.average || 5.0}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-white text-sm">
                          {user.points} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
