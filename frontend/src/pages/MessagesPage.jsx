import React, { useEffect, useState } from 'react';
import { MessageSquare, Paperclip, Mic, ArrowRight, Search } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ChatDrawer from '../components/chat/ChatDrawer';
import api from '../services/api';

const getPreview = (conversation) => {
  if (conversation.type === 'VOICE') return 'Voice note';
  if (conversation.type === 'FILE') return `File: ${conversation.attachment?.name || 'attachment'}`;
  return conversation.content || 'New message';
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    const loadInbox = async () => {
      try {
        const res = await api.get('/messages/inbox');
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInbox();
  }, []);

  const filteredConversations = conversations.filter((conversation) => {
    const query = search.toLowerCase();
    return [
      conversation.otherUser?.name,
      conversation.task?.title,
      getPreview(conversation),
    ].some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" /> Inbox
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Your chats</h1>
            <p className="text-sm text-slate-400 mt-1">Messages from requesters and volunteers, grouped by task.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search chats"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <section className="glass-panel rounded-3xl border border-slate-800 p-4 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h2 className="text-sm font-bold text-white">All conversations</h2>
            <span className="text-xs text-slate-500">{conversations.length} total</span>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 text-center py-12">Loading chats...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">{search ? 'No chats match your search' : 'No chats yet'}</p>
              <p className="text-xs text-slate-500 mt-1">Task conversations will appear here when someone messages you.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => setActiveConversation(conversation)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors"
                >
                  <img
                    src={conversation.otherUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(conversation.otherUser?.name || 'User')}`}
                    alt={conversation.otherUser?.name || 'User'}
                    className="w-11 h-11 rounded-xl bg-slate-800 object-cover shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className={`text-sm truncate ${conversation.unread ? 'font-extrabold text-white' : 'font-bold text-slate-200'}`}>{conversation.otherUser?.name || 'Chat participant'}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{new Date(conversation.createdAt).toLocaleString()}</span>
                    </span>
                    <span className="block text-xs text-emerald-400 truncate mt-1">{conversation.task?.title || 'Micro-task chat'}</span>
                    <span className={`block text-xs truncate mt-1 ${conversation.unread ? 'font-semibold text-white' : 'text-slate-400'}`}>
                      {conversation.type === 'FILE' && <Paperclip className="w-3.5 h-3.5 inline mr-1" />}
                      {conversation.type === 'VOICE' && <Mic className="w-3.5 h-3.5 inline mr-1" />}
                      {getPreview(conversation)}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />

      {activeConversation && (
        <ChatDrawer
          task={activeConversation.task}
          recipient={activeConversation.otherUser}
          onClose={() => setActiveConversation(null)}
        />
      )}
    </div>
  );
}
