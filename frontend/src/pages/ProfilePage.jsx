import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Sparkles, Clock, Award, Check, Save, FileText, Wand2 } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [availableMinutes, setAvailableMinutes] = useState(user?.availableMinutes || 15);
  const [preferredMode, setPreferredMode] = useState(user?.preferredMode || 'both');
  const [skillsText, setSkillsText] = useState((user?.skills || []).map(s => typeof s === 'string' ? s : s.name).join(', '));
  const [interestsText, setInterestsText] = useState((user?.interests || []).join(', '));
  const [profileText, setProfileText] = useState('');
  const [extracting, setExtracting] = useState(false);

  const handleExtractSkills = async () => {
    if (profileText.trim().length < 10) {
      toast.error('Add at least 10 characters of resume or profile text');
      return;
    }

    setExtracting(true);
    try {
      const res = await api.post('/users/skills/extract', { text: profileText });
      const extractedSkills = (res.data.skills || []).map((skill) => skill.name).filter(Boolean);
      const extractedInterests = (res.data.interests || []).filter(Boolean);
      setSkillsText((current) => [...new Set(`${current}, ${extractedSkills.join(', ')}`.split(',').map((value) => value.trim()).filter(Boolean))].join(', '));
      setInterestsText((current) => [...new Set(`${current}, ${extractedInterests.join(', ')}`.split(',').map((value) => value.trim()).filter(Boolean))].join(', '));
      toast.success('Skills and interests suggested from your profile text');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not extract profile skills');
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name, proficiency: 'Intermediate' }));
    const interestsArray = interestsText.split(',').map(i => i.trim()).filter(Boolean);

    const res = await updateProfile({
      name,
      bio,
      availableMinutes: Number(availableMinutes),
      preferredMode,
      skills: skillsArray,
      interests: interestsArray,
    });

    if (res.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(res.error || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl bg-slate-800 object-cover border border-slate-700"
            />
            <div>
              <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400">{user?.email} • {user?.role?.toUpperCase()}</p>
              <div className="flex items-center space-x-3 text-xs mt-2">
                <span className="text-amber-400 font-bold">⭐ {user?.rating?.average || 5.0} Rating</span>
                <span className="text-emerald-400 font-bold">{user?.points || 0} Points</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Headline</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio about your background and interests..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Default Available Minutes</label>
                <select
                  value={availableMinutes}
                  onChange={(e) => setAvailableMinutes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Location Mode</label>
                <select
                  value={preferredMode}
                  onChange={(e) => setPreferredMode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="online">Online Only</option>
                  <option value="in-person">In-Person Only</option>
                  <option value="both">Both Online & In-Person</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Skills (Comma separated)</label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="React, JavaScript, UI Design, Python"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Interests (Comma separated)</label>
              <input
                type="text"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="Technology, Education, Design, Community"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold text-white">AI Profile Suggestions</h3>
                  <p className="text-[11px] text-slate-400">Paste a resume summary or bio to suggest skills and interests.</p>
                </div>
              </div>
              <textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder="I build React interfaces, mentor students, and enjoy accessibility and education projects..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleExtractSkills}
                disabled={extracting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-300 text-xs font-bold disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                {extracting ? 'Analyzing...' : 'Suggest Skills'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-950 text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>

          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
}
