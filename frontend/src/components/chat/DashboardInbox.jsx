import React, { useEffect, useState } from 'react';
import { MessageSquare, Paperclip, Mic, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import ChatDrawer from './ChatDrawer';

const getPreview = (conversation) => {
  if (conversation.type === 'VOICE') return 'Voice note';
  if (conversation.type === 'FILE') return `File: ${conversation.attachment?.name || 'attachment'}`;
  return conversation.content || 'New message';
};

export default function DashboardInbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    const loadInbox = async () => {
      try {
        const res = await api.get('/messages/inbox');
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error('Failed to load message inbox:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInbox();
  }, []);

  return (
    <>
      <section className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Direct Messages
          </h2>
          <span className="text-xs text-slate-500">{conversations.length} conversations</span>
        </div>

        {loading ? (
          <div className="text-xs text-slate-500 text-center py-6">Loading messages...</div>
        ) : conversations.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-6">
            No direct messages yet. Task chats will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation._id}
                type="button"
                onClick={() => setActiveConversation(conversation)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors"
              >
                <img
                  src={conversation.otherUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(conversation.otherUser?.name || 'User')}`}
                  alt={conversation.otherUser?.name || 'User'}
                  className="w-9 h-9 rounded-xl bg-slate-800 object-cover shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{conversation.otherUser?.name || 'Chat participant'}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{new Date(conversation.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="block text-[11px] text-emerald-400 truncate mt-0.5">{conversation.task?.title || 'Micro-task chat'}</span>
                  <span className={`block text-xs truncate mt-1 ${conversation.unread ? 'text-white font-semibold' : 'text-slate-400'}`}>
                    {conversation.type === 'FILE' && <Paperclip className="w-3 h-3 inline mr-1" />}
                    {conversation.type === 'VOICE' && <Mic className="w-3 h-3 inline mr-1" />}
                    {getPreview(conversation)}
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>

      {activeConversation && (
        <ChatDrawer
          task={activeConversation.task}
          recipient={activeConversation.otherUser}
          onClose={() => setActiveConversation(null)}
        />
      )}
    </>
  );
}
