import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { 
  Sparkles, 
  Clock, 
  Trophy, 
  Bell, 
  MessageSquare,
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
import api from '../../services/api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }

    const fetchInbox = async () => {
      try {
        const res = await api.get('/messages/inbox');
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error('Failed to load chat inbox:', err);
      }
    };

    fetchInbox();
  }, [isAuthenticated]);

  const unreadChats = conversations.filter((conversation) => conversation.unread).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 flex items-center gap-3">
          
          {/* Brand Logo */}
          <Link to="/" className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3 group">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 truncate">
                <span className="truncate">Micro-Volunteer</span> <span className="gradient-text shrink-0">Match</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-emerald-400 font-semibold -mt-1 truncate">
                Turn 15 Mins Into Impact
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex min-w-0 shrink items-center space-x-0.5">
            {isAuthenticated && (
              <>
                <Link 
                  to="/tasks" 
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    location.pathname === '/tasks' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Explore Tasks
                </Link>

                <Link
                  to="/messages"
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${location.pathname === '/messages' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chats
                  {unreadChats > 0 && <span className="min-w-4 h-4 px-1 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">{unreadChats > 9 ? '9+' : unreadChats}</span>}
                </Link>

                <Link 
                  to="/quick-tasks" 
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    location.pathname === '/quick-tasks' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  I Have 15 Minutes
                </Link>

                <Link 
                  to="/learning" 
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    location.pathname === '/learning' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Learn
                </Link>

                <Link 
                  to="/achievements" 
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    location.pathname === '/achievements' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Leaderboard
                </Link>

                {/* AI Assistant Button */}
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-2 py-2 rounded-lg text-xs font-medium text-emerald-300 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-center gap-1 shadow-sm hover:shadow-emerald-500/10"
                >
                  <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>AI Assistant</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex shrink-0 items-center space-x-1 sm:space-x-2 lg:space-x-3">
            {isAuthenticated ? (
              <>
                {/* Role Specific Quick Action */}
                {user.role === 'requester' ? (
                  <Link
                    to="/create-task"
                    className="hidden xl:flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post Task
                  </Link>
                ) : user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="hidden xl:flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
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
                  <span className="hidden xl:block text-xs font-semibold text-slate-200">
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
              className="xl:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden glass-panel border-t border-slate-800 px-4 py-4 space-y-3">
            {isAuthenticated && (
              <>
                <Link
                  to="/tasks"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/tasks' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'}`}
                >
                  Explore Tasks
                </Link>
                <Link
                  to="/achievements"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/achievements' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'}`}
                >
                  Leaderboard & Badges
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === '/messages' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'}`}
                >
                  <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Chats{unreadChats > 0 ? ` (${unreadChats > 9 ? '9+' : unreadChats})` : ''}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAiModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  AI Assistant Chat
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* AI Assistant Modal */}
      {showAiModal && <AiAssistantModal onClose={() => setShowAiModal(false)} />}
    </>
  );
}
