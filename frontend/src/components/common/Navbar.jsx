import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { 
  Sparkles, 
  Clock, 
  Trophy, 
  BarChart3, 
  Bell, 
  User, 
  LogOut, 
  PlusCircle, 
  Search, 
  Bot, 
  Bookmark, 
  CheckCircle2,
  Shield,
  Menu,
  X,
  Briefcase,
  GraduationCap,
  Globe
} from 'lucide-react';
import AiAssistantModal from '../ai/AiAssistantModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Micro-Volunteer <span className="gradient-text">Match</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-emerald-400 font-semibold -mt-1">
                Turn 15 Mins Into Impact
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link 
              to="/tasks" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/tasks' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              Explore Tasks
            </Link>

            <Link 
              to="/quick-tasks" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/quick-tasks' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              I Have 15 Minutes
            </Link>

            <Link 
              to="/learning" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/learning' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Learn
            </Link>

            <Link 
              to="/impact" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/impact' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Impact
            </Link>

            <Link 
              to="/achievements" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/achievements' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Leaderboard
            </Link>

            {/* AI Assistant Button */}
            <button
              onClick={() => setShowAiModal(true)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-300 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-center gap-1.5 shadow-sm hover:shadow-emerald-500/10"
            >
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>AI Assistant</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Role Specific Quick Action */}
                {user.role === 'requester' ? (
                  <Link
                    to="/create-task"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post Task
                  </Link>
                ) : user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md shadow-purple-600/20 transition-all"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                ) : null}

                {/* Notifications Dropdown Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-emerald-400" /> Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-emerald-400 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto space-y-2.5">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n._id}
                              to={n.link || '#'}
                              onClick={() => setShowNotifications(false)}
                              className={`block p-3 rounded-xl border text-xs transition-colors ${
                                n.isRead ? 'bg-slate-900/50 border-slate-800/50 text-slate-400' : 'bg-emerald-950/20 border-emerald-500/20 text-slate-200 font-medium'
                              }`}
                            >
                              <div className="font-bold text-white mb-0.5">{n.title}</div>
                              <div>{n.message}</div>
                              <div className="text-[10px] text-slate-500 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard / Profile Button */}
                <Link
                  to={user.role === 'volunteer' ? '/dashboard' : user.role === 'requester' ? '/requester/dashboard' : '/admin'}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800/60 border border-slate-800 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg bg-slate-800 object-cover"
                  />
                  <span className="hidden lg:block text-sm font-semibold text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 transition-transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-slate-800 px-4 py-4 space-y-3">
            <Link
              to="/tasks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Explore Tasks
            </Link>
            <Link
              to="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Impact Platform
            </Link>
            <Link
              to="/achievements"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Leaderboard & Badges
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowAiModal(true);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/20"
            >
              AI Assistant Chat
            </button>
          </div>
        )}
      </header>

      {/* AI Assistant Modal */}
      {showAiModal && <AiAssistantModal onClose={() => setShowAiModal(false)} />}
    </>
  );
}
