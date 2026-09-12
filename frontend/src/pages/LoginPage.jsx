import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Clock, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      if (res.user.role === 'volunteer') navigate('/dashboard');
      else if (res.user.role === 'requester') navigate('/requester/dashboard');
      else navigate('/admin');
    } else {
      toast.error(res.error || 'Invalid credentials');
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
            <p className="text-xs text-slate-400">Log in to find micro-tasks or manage requests</p>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-emerald-500/20 text-xs space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Demo Quick Login:
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => fillDemoAccount('alex.volunteer@student.edu', 'password123')}
                className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-[10px] text-slate-300 font-bold border border-slate-700 text-center"
              >
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('sarah.requester@campus.edu', 'password123')}
                className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-[10px] text-slate-300 font-bold border border-slate-700 text-center"
              >
                Requester
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@microvolunteer.org', 'password123')}
                className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-[10px] text-slate-300 font-bold border border-slate-700 text-center"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@student.edu"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-950 text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02]"
            >
              <span>{loading ? 'Logging in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-400 font-bold hover:underline">
              Create an account
            </Link>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
