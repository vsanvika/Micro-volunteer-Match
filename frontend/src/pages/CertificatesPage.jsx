import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Copy, ShieldCheck } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [eligibility, setEligibility] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [myRes, eligRes] = await Promise.all([
          api.get('/certificates/my'),
          api.get('/certificates/eligibility'),
        ]);
        setCertificates(myRes.data.certificates || []);
        setEligibility(eligRes.data.eligibility || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const generate = async (type) => {
    try {
      const res = await api.post('/certificates/generate', { type });
      setCertificates(prev => [res.data.certificate, ...prev]);
      alert('Certificate generated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to generate certificate');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        <div className="glass-panel rounded-3xl border border-slate-800 p-6 bg-gradient-to-br from-slate-900 to-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
            <Award className="w-4 h-4" /> Digital Certificates
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-3">Volunteer achievements</h1>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {eligibility.map(item => (
            <div key={item.type} className="glass-panel rounded-3xl border border-slate-800 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{item.achievement}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.eligible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                  {item.eligible ? 'Eligible' : 'In progress'}
                </span>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                Progress: {Math.min(item.progress?.current || 0, item.progress?.target || 1)} / {item.progress?.target || 1}
              </div>
              <button
                onClick={() => generate(item.type)}
                disabled={!item.eligible}
                className="mt-4 w-full rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-40 bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              >
                Generate Certificate
              </button>
            </div>
          ))}
        </section>

        <section className="glass-panel rounded-3xl border border-slate-800 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-4"><ShieldCheck className="w-4 h-4 text-emerald-400" /> My Certificates</div>
          <div className="space-y-3">
            {certificates.length === 0 ? <div className="text-sm text-slate-500">No certificates issued yet.</div> : certificates.map(cert => (
              <div key={cert._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div>
                  <div className="font-bold text-white">{cert.achievement}</div>
                  <div className="text-xs text-slate-400 mt-1">ID: {cert.verificationId}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/certificates/${cert.verificationId}/verify`} className="text-xs text-emerald-400 font-bold">Verify</a>
                  <button onClick={() => navigator.clipboard.writeText(cert.verificationId)} className="text-xs inline-flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1 text-slate-200">
                    <Copy className="w-3 h-3" /> Copy ID
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
