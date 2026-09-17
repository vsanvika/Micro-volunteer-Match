import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Sparkles, 
  User, 
  Tag, 
  CheckCircle2, 
  MessageSquare, 
  Star, 
  Bookmark, 
  Share2, 
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Award
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MatchBadge from '../components/common/MatchBadge';
import ChatDrawer from '../components/chat/ChatDrawer';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [joiningRole, setJoiningRole] = useState(null);

  // Completion confirmation state
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [completionLocation, setCompletionLocation] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data.task);
    } catch (err) {
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in as a volunteer to apply');
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await api.post(`/applications/tasks/${id}/apply`, { coverNote });
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      fetchTaskDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await api.post(`/applications/tasks/${id}/complete`, { completionLocation });
      toast.success('Task marked as completed! Waiting for requester confirmation.');
      fetchTaskDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task');
    }
  };

  const handleJoinTeamRole = async (roleIndex) => {
    if (!isAuthenticated) {
      toast.error('Please log in as a volunteer to join a team role');
      navigate('/login');
      return;
    }

    setJoiningRole(roleIndex);
    try {
      await api.post(`/applications/tasks/${id}/team/join`, { roleIndex });
      toast.success('Team role joined successfully!');
      fetchTaskDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join team role');
    } finally {
      setJoiningRole(null);
    }
  };

  const handleConfirmCompletion = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/applications/tasks/${id}/confirm`, { stars, comment });
      toast.success(`Task confirmed! Awarded +${res.data.pointsEarned || task.estimatedDuration} points.`);
      setShowConfirmModal(false);
      await fetchCurrentUser();
      fetchTaskDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">Loading task details...</div>
        <Footer />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">Task not found</div>
        <Footer />
      </div>
    );
  }

  const isOwner = user && task.requester?._id === user._id;
  const isAssignedVolunteer = user && task.assignedVolunteers?.some(v => (v._id || v) === user._id);
  const userApp = task.userApplication;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Back Link */}
        <Link to="/tasks" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </Link>

        {/* Task Details Card Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  {task.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                  {task.difficulty}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold uppercase">
                  {task.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{task.title}</h1>
            </div>

            <MatchBadge score={task.matchScore || 85} level={task.matchLevel || 'Good Match'} />
          </div>

          {/* Key Task Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 font-bold block mb-1">Estimated Duration</span>
              <span className="text-emerald-400 font-extrabold text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" /> {task.estimatedDuration} Minutes
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block mb-1">Location Mode</span>
                <span className="text-white font-extrabold text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4 text-sky-400" /> {task.locationMode === 'online' ? 'Online' : task.locationAddress || 'Offline'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block mb-1">Reward Points</span>
              <span className="text-amber-400 font-extrabold text-sm flex items-center gap-1">
                <Award className="w-4 h-4" /> +{task.estimatedDuration} Points
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block mb-1">Requester</span>
              <span className="text-slate-200 font-bold text-xs truncate block">
                {task.requester?.organizationName || task.requester?.name || 'Campus Requester'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Description</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(task.requiredSkills || []).map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-300">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {task.isTeamTask && task.teamRoles && task.teamRoles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Team Roles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {task.teamRoles.map((role, index) => (
                  <div key={`${role.role}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <div className="text-sm font-bold text-white">{role.role}</div>
                        <div className="text-[11px] text-slate-400">{role.skillRequired || 'Any relevant skill'}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${role.filled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {role.filled ? 'Filled' : 'Open'}
                      </span>
                    </div>

                    {role.filled ? (
                      <div className="text-[11px] text-slate-400">
                        {role.volunteer?.name ? `Assigned to ${role.volunteer.name}` : 'Role filled'}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={user?.role !== 'volunteer' || joiningRole === index}
                        onClick={() => handleJoinTeamRole(index)}
                        className="w-full mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joiningRole === index ? 'Joining...' : 'Join This Role'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why This is a Great Match Box */}
          {task.matchReasons && task.matchReasons.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl space-y-2">
              <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Why This is a Great Match For You:
              </h4>
              <ul className="space-y-1 text-xs text-slate-200">
                {task.matchReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            
            {/* Volunteer Action Buttons */}
            {user?.role === 'volunteer' && (
              <div className="flex items-center space-x-3">
                {userApp ? (
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 rounded-xl bg-slate-800 text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
                      Status: {userApp.status}
                    </span>
                    {userApp.status === 'ACCEPTED' && task.status !== 'CONFIRMED' && (
                      <button
                        onClick={() => {
                          if (task.locationMode === 'offline') {
                            const confirmedLocation = window.prompt(`Confirm offline location: ${task.locationAddress || ''}`, task.locationAddress || '');
                            if (!confirmedLocation?.trim()) return;
                            setCompletionLocation(confirmedLocation.trim());
                            api.post(`/applications/tasks/${id}/complete`, { completionLocation: confirmedLocation.trim() })
                              .then(() => { toast.success('Offline task marked as completed!'); fetchTaskDetails(); })
                              .catch((err) => toast.error(err.response?.data?.message || 'Failed to complete task'));
                            return;
                          }
                          handleMarkComplete();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                ) : task.status === 'OPEN' ? (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
                  >
                    Apply Now ({task.estimatedDuration} Mins)
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-bold">This task is currently {task.status.toLowerCase()}</span>
                )}
              </div>
            )}

            {/* Requester Confirm Completion Button */}
            {isOwner && task.status === 'COMPLETED' && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20"
              >
                Confirm Completion & Award Points
              </button>
            )}

            {/* Chat Drawer Toggle if connected */}
            {(isOwner || isAssignedVolunteer) && (
              <button
                onClick={() => setShowChat(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Open Task Chat</span>
              </button>
            )}

          </div>

        </div>

      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Apply for "{task.title}"</h3>
            <p className="text-xs text-slate-400">
              Your profile skills ({task.matchScore}% Match) will be sent to the requester.
            </p>
            <textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Optional short note (e.g. 'I can do this right now in 15 mins!')"
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Completion & Rating Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Task & Rate Volunteer</h3>
            <p className="text-xs text-slate-400">
              Confirming will award +{task.estimatedDuration} points & log volunteer minutes.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rating (1 - 5 Stars)</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className="p-1.5 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${s <= stars ? 'fill-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a brief review..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold"
              >
                Confirm & Award Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Drawer */}
      {showChat && (
        <ChatDrawer
          task={task}
          recipient={isOwner ? task.assignedVolunteers?.[0] : task.requester}
          onClose={() => setShowChat(false)}
        />
      )}

      <Footer />
    </div>
  );
}
