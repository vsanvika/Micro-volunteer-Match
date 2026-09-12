import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  Ban, 
  Check, 
  Clock 
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [organizationsList, setOrganizationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, reports, organizations

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes, orgRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/reports'),
        api.get('/admin/organizations'),
      ]);
      setStats(statsRes.data.stats || {});
      setUsersList(usersRes.data.users || []);
      setReportsList(reportsRes.data.reports || []);
      setOrganizationsList(orgRes.data.organizations || []);
    } catch (err) {
      toast.error('Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-suspend`);
      toast.success(res.data.message);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to toggle suspend status');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await api.put(`/admin/reports/${reportId}`, { status });
      toast.success(`Report marked as ${status}`);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update report');
    }
  };

  const handleVerifyOrganization = async (orgId, approve) => {
    try {
      const res = await api.put(`/admin/organizations/${orgId}/verify`, { approve });
      toast.success(res.data.organization?.verificationStatus || 'Organization updated');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update organization verification');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" /> Admin Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage users, moderate safety reports, and monitor platform health
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Users ({usersList.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'reports' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reports ({reportsList.length})
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'organizations' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Organizations ({organizationsList.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-white">{stats.totalUsers || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Users</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-emerald-400">{stats.completedTasks || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tasks Completed</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
              <Clock className="w-6 h-6 text-sky-400 mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-sky-400">{stats.openTasks || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Open Tasks</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
              <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-amber-400">{stats.pendingReports || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Reports</div>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Points</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-xl bg-slate-800 object-cover" />
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-[11px] text-slate-300">{u.role}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{u.points || 0} pts</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isSuspended ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleSuspend(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            u.isSuspended ? 'bg-emerald-500 text-slate-950' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {reportsList.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">No reports logged yet.</div>
            ) : (
              reportsList.map((r) => (
                <div key={r._id} className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-amber-400 font-bold uppercase text-[10px]">{r.reason}</span>
                    <p className="text-white font-bold mt-0.5">{r.description || 'No description provided.'}</p>
                    <span className="text-[10px] text-slate-500">Reporter: {r.reporter?.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolveReport(r._id, 'DISMISSED')}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolveReport(r._id, 'RESOLVED')}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'organizations' && (
          <div className="space-y-3">
            {organizationsList.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">No organization profiles have been created yet.</div>
            ) : (
              organizationsList.map((org) => (
                <div key={org._id} className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-white">{org.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {org.category} • {org.location?.city || 'Unknown city'}, {org.location?.country || 'India'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Owner: {org.user?.name || 'Unknown'} • Status: {org.verificationStatus || 'NONE'}
                    </div>
                  </div>

                  {org.verificationStatus !== 'APPROVED' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyOrganization(org._id, false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerifyOrganization(org._id, true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                      >
                        Approve
                      </button>
                    </div>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      Verified
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
