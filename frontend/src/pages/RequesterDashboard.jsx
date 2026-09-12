import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  MessageSquare, 
  Building,
  Star
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RequesterDashboard() {
  const [createdTasks, setCreatedTasks] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Applicant review modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    fetchMyCreatedTasks();
    fetchMyOrganization();
  }, []);

  const fetchMyOrganization = async () => {
    try {
      const res = await api.get('/organizations/my');
      setOrganization(res.data.organization || null);
    } catch (err) {
      setOrganization(null);
    }
  };

  const fetchMyCreatedTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/my-created');
      setCreatedTasks(res.data.tasks || []);
    } catch (err) {
      toast.error('Failed to load posted tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplicants = async (task) => {
    setSelectedTask(task);
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/applications/tasks/${task._id}/applications`);
      setApplicants(res.data.applications || []);
    } catch (err) {
      toast.error('Failed to load applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleApplicationDecision = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}`, { status });
      toast.success(`Applicant ${status.toLowerCase()}!`);
      handleOpenApplicants(selectedTask);
      fetchMyCreatedTasks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-emerald-400" /> Requester Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your posted micro-tasks and review volunteer applicants
            </p>
          </div>

          <Link
            to="/create-task"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Post New Task
          </Link>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Organization Profile</h2>
              <p className="text-xs text-slate-400 mt-1">
                {organization
                  ? `Verified status: ${organization.verificationStatus || 'NONE'}`
                  : 'Create your organization to build trust and unlock verified requests.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/organization"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800"
              >
                {organization ? 'Manage Profile' : 'Create Profile'}
              </Link>
              {organization && organization.verificationStatus !== 'APPROVED' && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.post(`/organizations/${organization._id}/request-verification`);
                      toast.success('Verification request sent.');
                      fetchMyOrganization();
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Failed to request verification');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold"
                >
                  {organization.verificationStatus === 'PENDING' ? 'Verification Pending' : 'Request Verification'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Your Posted Micro-Tasks ({createdTasks.length})</h2>

          {loading ? (
            <div className="text-xs text-slate-500 text-center py-10">Loading your tasks...</div>
          ) : createdTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">You haven't posted any micro-tasks yet.</p>
              <Link
                to="/create-task"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" /> Post Your First Task
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {createdTasks.map((t) => (
                <div
                  key={t._id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {t.category}
                      </span>
                      <span className="text-slate-500 text-xs font-semibold">{t.estimatedDuration} Mins</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                        {t.status}
                      </span>
                    </div>
                    <Link to={`/tasks/${t._id}`} className="text-base font-bold text-white hover:text-emerald-400 transition-colors block">
                      {t.title}
                    </Link>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleOpenApplicants(t)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 flex items-center gap-1.5"
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Applicants ({t.applicantCount || 0})</span>
                      {t.pendingApplicantCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </button>

                    <Link
                      to={`/tasks/${t._id}`}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Review Applicants Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Applicants for "{selectedTask.title}"</h3>
                <p className="text-xs text-slate-400">Review volunteer skill match percentages and accept</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-xs text-slate-400 hover:text-white">
                Close
              </button>
            </div>

            {loadingApplicants ? (
              <div className="text-xs text-slate-500 text-center py-8">Loading applicants...</div>
            ) : applicants.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">No applications received yet.</div>
            ) : (
              <div className="space-y-3">
                {applicants.map((app) => (
                  <div
                    key={app._id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={app.volunteer?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${app.volunteer?.name}`}
                          alt={app.volunteer?.name}
                          className="w-9 h-9 rounded-xl bg-slate-800 object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-white">{app.volunteer?.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            ⭐ {app.volunteer?.rating?.average || 5.0} • {app.volunteer?.tasksCompleted || 0} tasks completed
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        <Sparkles className="w-3 h-3 inline mr-1" /> {app.matchScore}% Match
                      </span>
                    </div>

                    {app.coverNote && (
                      <p className="text-slate-300 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                        "{app.coverNote}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-500 uppercase font-bold">Status: {app.status}</span>
                      
                      {app.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApplicationDecision(app._id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/40 font-bold"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApplicationDecision(app._id, 'ACCEPTED')}
                            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                          >
                            Accept Volunteer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
