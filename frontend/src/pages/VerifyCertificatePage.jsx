import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyCertificatePage() {
  const { verificationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/certificates/${verificationId}/verify`);
        setData(res.data);
      } catch (err) {
        setData({ success: true, valid: false, message: 'Verification unavailable' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [verificationId]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Loading verification…</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="glass-panel rounded-3xl border border-slate-800 p-8 text-center">
          {data?.valid ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">Valid Certificate</div>
              <h1 className="text-3xl font-extrabold text-white mt-3">Certificate Verification</h1>
              <div className="mt-6 text-left space-y-3 text-sm text-slate-300">
                <div><span className="text-slate-500">ID:</span> {data.certificate.verificationId}</div>
                <div><span className="text-slate-500">Volunteer:</span> {data.certificate.volunteerName}</div>
                <div><span className="text-slate-500">Achievement:</span> {data.certificate.achievement}</div>
                <div><span className="text-slate-500">Verified Tasks:</span> {data.certificate.tasksCompleted}</div>
                <div><span className="text-slate-500">Volunteer Time:</span> {data.certificate.volunteerMinutes} minutes</div>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-3xl font-extrabold text-white">Certificate Not Found</h1>
              <p className="mt-3 text-slate-400">{data?.message || 'This certificate could not be verified.'}</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
