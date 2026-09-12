import React, { useEffect, useState } from 'react';
import { Bookmark, Clock, ArrowRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TaskCard from '../components/tasks/TaskCard';
import api from '../services/api';

export default function SavedTasksPage() {
  const [savedTasks, setSavedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedTasks();
  }, []);

  const fetchSavedTasks = async () => {
    try {
      const res = await api.get('/users/saved-tasks');
      setSavedTasks(res.data.savedTasks || []);
    } catch (err) {
      console.error('Failed to load saved tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-400" /> Bookmarked Tasks
          </h1>
        </div>

        {loading ? (
          <div className="text-xs text-slate-500 text-center py-12">Loading saved tasks...</div>
        ) : savedTasks.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-2">
            <p className="text-xs text-slate-400">You haven't bookmarked any tasks yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
