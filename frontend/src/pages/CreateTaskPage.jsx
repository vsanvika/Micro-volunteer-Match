import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Wand2, Sparkles, Clock, MapPin, Tag, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SmartTaskCreatorModal from '../components/ai/SmartTaskCreatorModal';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Education');
  const [requiredSkills, setRequiredSkills] = useState('React, JavaScript');
  const [estimatedDuration, setEstimatedDuration] = useState(15);
  const [difficulty, setDifficulty] = useState('Beginner');
  const [locationMode, setLocationMode] = useState('online');
  const [locationAddress, setLocationAddress] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Education', 'Technology', 'Design', 'Translation', 'Community', 'Writing', 'Social Media', 'Donations'];
  const durations = [5, 10, 15, 30, 45, 60];

  const handleApplyAiSuggestions = (suggestions) => {
    if (suggestions.title) setTitle(suggestions.title);
    if (suggestions.description) setDescription(suggestions.description);
    if (suggestions.category) setCategory(suggestions.category);
    if (suggestions.estimatedDuration) setEstimatedDuration(suggestions.estimatedDuration);
    if (suggestions.difficulty) setDifficulty(suggestions.difficulty);
    if (suggestions.requiredSkills) {
      setRequiredSkills(suggestions.requiredSkills.join(', '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Please enter a title and description');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/tasks', {
        title,
        description,
        category,
        requiredSkills,
        estimatedDuration: Number(estimatedDuration),
        difficulty,
        locationMode,
        locationAddress: locationMode === 'in-person' ? locationAddress : '',
        priority,
      });

      toast.success('Micro-task posted successfully!');
      navigate('/requester/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Bar */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-emerald-400" /> Post a Micro-Task
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect with students and volunteers for quick 5 to 60 minute tasks
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 hover:border-emerald-400 transition-colors"
          >
            <Wand2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Smart AI Creator</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Explain Java Loops to a Freshman Student"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Duration</label>
              <select
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
              >
                {durations.map((d) => (
                  <option key={d} value={d}>{d} Minutes</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Required Skills (Comma separated)</label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. React, JavaScript, UI/UX"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task details, clear goal, and what help is needed..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location Mode</label>
              <select
                value={locationMode}
                onChange={(e) => setLocationMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {locationMode === 'in-person' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campus Location / Address</label>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="e.g. Student Union Room 204"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/requester/dashboard')}
              className="px-5 py-3 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-950 text-xs shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
            >
              {submitting ? 'Publishing Task...' : 'Publish Micro-Task'}
            </button>
          </div>

        </form>

      </main>

      {showAiModal && (
        <SmartTaskCreatorModal
          onClose={() => setShowAiModal(false)}
          onApplySuggestions={handleApplyAiSuggestions}
        />
      )}

      <Footer />
    </div>
  );
}
