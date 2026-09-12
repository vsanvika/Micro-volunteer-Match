import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, Clock } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/useAuthStore';

export default function ChatDrawer({ task, recipient, onClose }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!task?._id) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/task/${task._id}`);
        setMessages(res.data.messages || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Socket Room Joining
    const socket = getSocket();
    if (socket) {
      socket.emit('join_chat', task._id);
      socket.on('new_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [task?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !task?._id || !recipient?._id) return;

    const textToSend = content;
    setContent('');

    try {
      await api.post('/messages', {
        taskId: task._id,
        recipientId: recipient._id,
        content: textToSend,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-panel border-l border-slate-800 bg-slate-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <img
            src={recipient?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(recipient?.name || 'User')}`}
            alt={recipient?.name}
            className="w-9 h-9 rounded-xl bg-slate-800 object-cover"
          />
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">{recipient?.name || 'Chat User'}</h4>
            <p className="text-[11px] text-emerald-400 font-semibold">{task?.title || 'Micro Task'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-xs text-slate-500 text-center py-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-10">
            No messages yet. Send a message to coordinate task details!
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender?._id === user?._id || m.sender === user?._id;
            return (
              <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-slate-600 mt-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
