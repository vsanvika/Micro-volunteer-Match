import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Tag, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" /> My Volunteer Applications
          </h1>
        </div>

        {loading ? (
          <div className="text-xs text-slate-500 text-center py-12">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
            <p className="text-xs text-slate-400">You haven't applied for any micro-tasks yet.</p>
            <Link to="/tasks" className="inline-block px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold">
              Explore Available Tasks
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      {app.task?.category}
                    </span>
                    <span className="text-slate-400 text-xs font-bold">{app.task?.estimatedDuration} Mins</span>
                  </div>
                  <Link to={`/tasks/${app.task?._id}`} className="text-base font-bold text-white hover:text-emerald-400 transition-colors block">
                    {app.task?.title}
                  </Link>
                  {app.coverNote && (
                    <p className="text-xs text-slate-400 italic">"{app.coverNote}"</p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    app.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    app.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {app.status}
                  </span>
                  <Link
                    to={`/tasks/${app.task?._id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    View Task
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
