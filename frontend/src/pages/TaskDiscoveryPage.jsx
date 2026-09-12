import React, { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Search, Sparkles, Filter, Clock } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilter from '../components/tasks/TaskFilter';
import TimeQuickPicker from '../components/common/TimeQuickPicker';

export default function TaskDiscoveryPage() {
  const { tasks, loading, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              Discover Micro-Tasks <Sparkles className="w-5 h-5 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse micro-volunteering opportunities matched by skills, category, and available duration
            </p>
          </div>
        </div>

        {/* Quick Time Selector */}
        <TimeQuickPicker />

        {/* Filters */}
        <TaskFilter />

        {/* Results Count & Grid */}
        <div className="space-y-4">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Showing <strong className="text-white">{tasks.length}</strong> available tasks</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-800 h-48 animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No tasks match your search criteria</h3>
              <p className="text-xs text-slate-400">Try clearing filters or adjusting your search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
