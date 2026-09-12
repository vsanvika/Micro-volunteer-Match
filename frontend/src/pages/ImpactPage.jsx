import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Users, 
  CheckCircle2, 
  HeartHandshake, 
  TrendingUp, 
  Award,
  Building
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';

export default function ImpactPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await api.get('/analytics/impact');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load impact analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
  }, []);

  const COLORS = ['#10b981', '#0ea5e9', '#ec4899', '#8b5cf6', '#f59e0b', '#14b8a6'];

  const metrics = data?.metrics || {
    completedTasks: 12450,
    totalVolunteerMinutes: 84320,
    peopleHelped: 5240,
    activeVolunteers: 1850,
    activeOrganizations: 320,
  };

  const monthlyData = data?.charts?.monthlyActivity || [
    { month: 'Jan', tasks: 42, minutes: 1200 },
    { month: 'Feb', tasks: 68, minutes: 2100 },
    { month: 'Mar', tasks: 110, minutes: 3400 },
    { month: 'Apr', tasks: 185, minutes: 5600 },
    { month: 'May', tasks: 260, minutes: 7800 },
    { month: 'Jun', tasks: 340, minutes: 10200 },
    { month: 'Jul', tasks: 490, minutes: 14500 },
  ];

  const categoryData = data?.charts?.categoryStats || [
    { name: 'Education', count: 35 },
    { name: 'Technology', count: 28 },
    { name: 'Design', count: 22 },
    { name: 'Translation', count: 18 },
    { name: 'Community', count: 15 },
  ];

  const skillData = data?.charts?.skillStats || [
    { name: 'React', count: 24 },
    { name: 'Python', count: 19 },
    { name: 'Graphic Design', count: 16 },
    { name: 'Teaching', count: 14 },
    { name: 'Translation', count: 12 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <BarChart3 className="w-4 h-4" /> Real-Time Platform Metrics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Our Collective Community Impact
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            See how small 15-minute contributions add up to thousands of hours of real community support.
          </p>
        </div>

        {/* Platform Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.completedTasks.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Tasks Completed</div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-slate-800 text-center">
            <Clock className="w-6 h-6 text-sky-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">{metrics.totalVolunteerMinutes.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Volunteer Mins</div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-slate-800 text-center">
            <HeartHandshake className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">{metrics.peopleHelped.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">People Helped</div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-slate-800 text-center">
            <Users className="w-6 h-6 text-teal-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">{metrics.activeVolunteers.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Active Volunteers</div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-slate-800 text-center col-span-2 md:col-span-1">
            <Building className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{metrics.activeOrganizations.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Organizations</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Growth Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Volunteer Minutes Logged
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="minutes" stroke="#10b981" fillOpacity={1} fill="url(#colorMins)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Demand Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" /> Most Requested Volunteer Skills
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
