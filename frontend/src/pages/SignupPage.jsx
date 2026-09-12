import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Clock, User, Mail, Lock, Sparkles, Building, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function SignupPage() {
  const [role, setRole] = useState('volunteer'); // volunteer or requester
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [bio, setBio] = useState('');
  const [availableMinutes, setAvailableMinutes] = useState(15);
  const [selectedSkills, setSelectedSkills] = useState(['React', 'Python']);
  const [selectedInterests, setSelectedInterests] = useState(['Technology', 'Education']);

  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const availableSkillOptions = ['React', 'JavaScript', 'Python', 'Java', 'UI/UX Design', 'Graphic Design', 'Teaching', 'Translation', 'Public Speaking', 'Social Media'];
  const availableInterestOptions = ['Education', 'Technology', 'Design', 'Translation', 'Community', 'Writing', 'Social Media', 'Environment'];

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
      organizationName: role === 'requester' ? organizationName : '',
      bio,
      availableMinutes: Number(availableMinutes),
      skills: selectedSkills.map(s => ({ name: s, proficiency: 'Intermediate' })),
      interests: selectedInterests,
    };

    const res = await register(payload);
    if (res.success) {
      toast.success('Account created successfully!');
      if (role === 'volunteer') navigate('/dashboard');
      else navigate('/requester/dashboard');
    } else {
      toast.error(res.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-xl glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-white">Join Micro-Volunteer Match</h2>
            <p className="text-xs text-slate-400">Create your account and start making instant impact</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'volunteer'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Volunteer (I want to help)</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('requester')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'requester'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Task Requester (Club/NGO)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@campus.edu"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {role === 'requester' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Club / Organization Name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Campus Coding Club"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Default Free Minutes Available</label>
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
              )}
            </div>

            {/* Skills selection for Volunteers */}
            {role === 'volunteer' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Skills</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSkillOptions.map((s) => {
                      const selected = selectedSkills.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {selected && '✓ '} {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Interests</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableInterestOptions.map((i) => {
                      const selected = selectedInterests.includes(i);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleInterest(i)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {selected && '✓ '} {i}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-950 text-xs shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02]"
            >
              {loading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">
              Log in here
            </Link>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
