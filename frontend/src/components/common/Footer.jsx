import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">Micro-Volunteer Match</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering students and community members to turn 5 to 60 spare minutes into meaningful, high-impact volunteer work.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/tasks" className="hover:text-emerald-400 transition-colors">Find Tasks</Link></li>
              <li><Link to="/impact" className="hover:text-emerald-400 transition-colors">Impact Analytics</Link></li>
              <li><Link to="/achievements" className="hover:text-emerald-400 transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">For Requesters</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/create-task" className="hover:text-emerald-400 transition-colors">Post a Micro-Task</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Clubs & NGOs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Safety & Trust</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Campus Verified Requests</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>AI-Powered Matching Engine</span>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Micro-Volunteer Match. Hackathon Demonstration Edition.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for community impact
          </p>
        </div>
      </div>
    </footer>
  );
}
