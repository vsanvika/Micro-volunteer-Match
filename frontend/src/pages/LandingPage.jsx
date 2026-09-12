import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Sparkles, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  HeartHandshake, 
  GraduationCap, 
  Code, 
  Palette, 
  BarChart3 
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import TaskCard from '../components/tasks/TaskCard';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TimeQuickPicker from '../components/common/TimeQuickPicker';

export default function LandingPage() {
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const featuredTasks = tasks.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold mb-8 animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Campus & NGO Micro-Volunteering Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Turn <span className="gradient-text">15 Minutes</span> Into Real Community Impact.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect students and volunteers with short, meaningful micro-tasks matching exact skills, interests, and free time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/tasks"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-transform hover:scale-105"
            >
              <span>Find a Micro-Task</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/create-task"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>Post a Task (Free)</span>
            </Link>
          </div>

          {/* Time Quick Picker Interactive Demo */}
          <div className="max-w-4xl mx-auto text-left mb-16">
            <TimeQuickPicker />
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">84,320+</div>
              <div className="text-xs text-slate-400 mt-0.5">Volunteer Minutes Logged</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">12,450+</div>
              <div className="text-xs text-slate-400 mt-0.5">Tasks Completed</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">5,240+</div>
              <div className="text-xs text-slate-400 mt-0.5">People Helped</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">96%</div>
              <div className="text-xs text-slate-400 mt-0.5">Matching Accuracy</div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Tasks Section */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Live Opportunities
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Featured Micro-Volunteering Tasks
              </h2>
            </div>
            <Link to="/tasks" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              View all 25+ open tasks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            How Micro-Volunteer Match Works
          </h2>
          <p className="text-sm text-slate-400">
            No long-term semester commitments required. Complete small, bite-sized tasks whenever you have 15 minutes of free time between classes or work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Set Your Free Time</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select if you have 5, 15, or 30 free minutes right now. Add your skills and preferences.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Smart Match</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our hybrid engine instantly matches you with verified tasks from students, campus clubs, and NGOs.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Earn Points & Badges</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete the task, get confirmed by the requester, earn gamified badges, and build your volunteer resume.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 mx-4 sm:mx-8 mb-16">
        <div className="max-w-7xl mx-auto glass-panel p-10 sm:p-14 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-950 text-center relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to make a difference in 15 minutes?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8">
            Join thousands of student volunteers making campus and community impact today.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/20 transition-transform hover:scale-105"
          >
            Create Free Volunteer Profile
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
