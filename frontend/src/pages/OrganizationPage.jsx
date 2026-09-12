import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Globe, MapPin, ShieldCheck, Save } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function OrganizationPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Community',
    website: '',
    logo: '',
    location: { city: '', country: 'India' },
  });
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organizations/my');
      const org = res.data.organization;
      setOrganization(org);
      if (org) {
        setForm({
          name: org.name || '',
          description: org.description || '',
          category: org.category || 'Community',
          website: org.website || '',
          logo: org.logo || '',
          location: org.location || { city: '', country: 'India' },
        });
      }
    } catch (err) {
      toast.error('Failed to load organization profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'city' || name === 'country') {
      setForm((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setSaving(true);
    try {
      if (organization?._id) {
        await api.put(`/organizations/${organization._id}`, form);
        toast.success('Organization profile updated');
      } else {
        const res = await api.post('/organizations', form);
        setOrganization(res.data.organization);
        toast.success('Organization profile created');
      }
      await fetchOrganization();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save organization profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!organization?._id) return;
    try {
      await api.post(`/organizations/${organization._id}/request-verification`);
      toast.success('Verification request sent');
      await fetchOrganization();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request verification');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-400" /> Organization Profile
              </h1>
              <p className="text-xs text-slate-400 mt-1">Build trust for your community requests and event campaigns.</p>
            </div>

            {organization && (
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${organization.verificationStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                  {organization.verificationStatus || 'NONE'}
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-xs text-slate-400 text-center py-8">Loading organization details...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Organization Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Campus Coding Club"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Community">Community</option>
                    <option value="Education">Education</option>
                    <option value="Technology">Technology</option>
                    <option value="Environment">Environment</option>
                    <option value="Nonprofit">Nonprofit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.org"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your mission, programs, and how you use volunteers."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Logo URL</label>
                <input
                  type="url"
                  name="logo"
                  value={form.logo}
                  onChange={handleChange}
                  placeholder="Optional image URL"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.location.city}
                    onChange={handleChange}
                    placeholder="Hyderabad"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={form.location.country}
                    onChange={handleChange}
                    placeholder="India"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : organization ? 'Update Profile' : 'Create Profile'}
                </button>

                {organization && organization.verificationStatus !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={handleRequestVerification}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {organization.verificationStatus === 'PENDING' ? 'Verification Pending' : 'Request Verification'}
                  </button>
                )}

                <Link
                  to="/requester/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  <MapPin className="w-4 h-4" /> Back to Dashboard
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}