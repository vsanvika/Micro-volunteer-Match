import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { 
  Sparkles, 
  Clock, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Search, 
  Bookmark, 
  Shield, 
  Award,
  BookOpen
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TaskCard from '../components/tasks/TaskCard';
import TimeQuickPicker from '../components/common/TimeQuickPicker';
import api from '../services/api';

export default function VolunteerDashboard() {
  const { user } = useAuthStore();
  const { tasks, recommendations, fetchRecommendations, fetchTasks, selectedTimeMinutes } = useTaskStore();
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
    fetchTasks();

    const loadApplications = async () => {
      try {
        const res = await api.get('/applications/my-applications');
        setMyApplications(res.data.applications || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [fetchRecommendations, fetchTasks]);

  const displayTasks = recommendations.length > 0 ? recommendations : tasks.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-extrabold text-white">
                Good morning, {user?.name?.split(' ')[0] || 'Volunteer'} 👋
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {user?.streak?.current || 0} Day Streak
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Ready to turn a few spare minutes into community impact today?
            </p>
          </div>

          {/* User Gamification Stats Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <div className="glass-panel p-3 px-4 rounded-2xl border border-slate-800 text-center min-w-[100px]">
              <div className="text-lg font-extrabold text-amber-400">{user?.points || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Points</div>
            </div>
            <div className="glass-panel p-3 px-4 rounded-2xl border border-slate-800 text-center min-w-[100px]">
              <div className="text-lg font-extrabold text-emerald-400">{user?.volunteerMinutes || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Mins Logged</div>
            </div>
            <div className="glass-panel p-3 px-4 rounded-2xl border border-slate-800 text-center min-w-[100px]">
              <div className="text-lg font-extrabold text-sky-400">{user?.tasksCompleted || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Completed</div>
            </div>
          </div>
        </div>

        {/* Time-Based Quick Match Selector */}
        <TimeQuickPicker />

        {/* Top AI Smart Recommended Tasks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="text-xl font-extrabold text-white">Recommended For You</h2>
              <span className="text-xs text-slate-400">({selectedTimeMinutes} min filter active)</span>
            </div>
            <Link to="/tasks" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              Explore All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {displayTasks.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-xs text-slate-400">
              No matching tasks found under {selectedTimeMinutes} mins right now. Try increasing your time filter above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </section>

        {/* My Applications & Activity Status */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" /> My Applications & Active Tasks
              </h3>
              <Link to="/applications" className="text-xs text-emerald-400 font-semibold hover:underline">
                View All
              </Link>
            </div>

            {myApplications.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-8">
                You have not applied for any micro-tasks yet. Click "View" on any task above to apply!
              </div>
            ) : (
              <div className="space-y-2.5">
                {myApplications.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{app.task?.title || 'Micro Task'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Duration: {app.task?.estimatedDuration} mins • {app.task?.category}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      app.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      app.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievement Progress Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase mb-1">
                <Trophy className="w-4 h-4" /> Next Milestone
              </div>
              <h3 className="text-base font-bold text-white mb-2">Super Volunteer Badge</h3>
              <p className="text-xs text-slate-400 mb-4">Complete {Math.max(0, 10 - (user?.tasksCompleted || 0))} more micro-tasks to unlock the Super Volunteer badge!</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full" style={{ width: `${Math.min(100, ((user?.tasksCompleted || 0) / 10) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                <span>{Math.min(user?.tasksCompleted || 0, 10)} / 10 Tasks</span>
                <span>{Math.min(100, Math.round(((user?.tasksCompleted || 0) / 10) * 100))}%</span>
              </div>
            </div>

            <Link
              to="/achievements"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs text-center border border-slate-800 transition-colors block"
            >
              View All Badges & Leaderboard
            </Link>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
