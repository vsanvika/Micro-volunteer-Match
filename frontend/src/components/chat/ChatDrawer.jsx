import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Paperclip, Mic, MicOff, Square, Phone, Video, VideoOff, PhoneOff, Download, Trash2, ListChecks, Save } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/useAuthStore';

export default function ChatDrawer({ task, recipient, onClose }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [callMode, setCallMode] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('');
  const [callMessageId, setCallMessageId] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [workspace, setWorkspace] = useState({ notes: '', checklist: [] });
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const voiceChunksRef = useRef([]);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    if (!task?._id) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/task/${task._id}`);
        setMessages(res.data.messages || []);
        const workspaceResponse = await api.get(`/tasks/${task._id}/workspace`);
        setWorkspace(workspaceResponse.data.workspace || { notes: '', checklist: [] });
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Socket Room Joining
    const socket = getSocket();
    socketRef.current = socket;
    if (socket) {
      socket.emit('join_chat', task._id);
      socket.on('new_message', (msg) => {
        setMessages((prev) => prev.some((message) => message._id === msg._id)
          ? prev.map((message) => message._id === msg._id ? msg : message)
          : [...prev, msg]);
      });
      socket.on('chat_cleared', () => setMessages([]));
      socket.on('workspace_updated', (updatedWorkspace) => setWorkspace(updatedWorkspace));
      socket.on('call_offer', ({ offer, mode, caller, callerId, callMessageId: incomingCallMessageId }) => {
        setIncomingCall({ offer, mode, caller, callerId, callMessageId: incomingCallMessageId });
        setCallStatus(`Incoming ${mode} call`);
      });
      socket.on('call_answer', async ({ answer, callMessageId: answeredCallMessageId }) => {
        if (peerRef.current) await peerRef.current.setRemoteDescription(answer);
        if (answeredCallMessageId) {
          clearTimeout(callTimerRef.current);
          setMessages((prev) => prev.map((message) => (
            message._id === answeredCallMessageId ? { ...message, callStatus: 'ANSWERED' } : message
          )));
        }
        setCallStatus('Connected');
      });
      socket.on('call_decline', async ({ callMessageId: declinedCallMessageId }) => {
        if (declinedCallMessageId) await updateCallLog(declinedCallMessageId, 'MISSED');
        endCall(false);
      });
      socket.on('call_ice_candidate', async ({ candidate }) => {
        if (peerRef.current && candidate) await peerRef.current.addIceCandidate(candidate);
      });
      socket.on('call_end', endCall);
    }

    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('chat_cleared');
        socket.off('workspace_updated');
        socket.off('call_offer');
        socket.off('call_answer');
        socket.off('call_decline');
        socket.off('call_ice_candidate');
        socket.off('call_end', endCall);
      }
      endCall(false);
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

  const clearChat = async () => {
    if (!task?._id || !recipient?._id || !window.confirm('Clear this chat for both participants?')) return;
    try {
      await api.delete(`/messages/task/${task._id}/conversation/${recipient._id}`);
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const saveWorkspace = async (nextWorkspace = workspace) => {
    setWorkspaceSaving(true);
    try {
      const response = await api.put(`/tasks/${task._id}/workspace`, nextWorkspace);
      setWorkspace(response.data.workspace);
    } catch (err) {
      console.error('Failed to save collaboration workspace:', err);
    } finally {
      setWorkspaceSaving(false);
    }
  };

  const addChecklistItem = () => {
    const text = newChecklistItem.trim();
    if (!text) return;
    const nextWorkspace = { ...workspace, checklist: [...workspace.checklist, { text, completed: false }] };
    setWorkspace(nextWorkspace);
    setNewChecklistItem('');
    saveWorkspace(nextWorkspace);
  };

  const toggleChecklistItem = (index) => {
    const checklist = workspace.checklist.map((item, itemIndex) => itemIndex === index ? { ...item, completed: !item.completed } : item);
    const nextWorkspace = { ...workspace, checklist };
    setWorkspace(nextWorkspace);
    saveWorkspace(nextWorkspace);
  };

  const sendAttachment = async (attachment, type, text = '') => {
    if (!task?._id || !recipient?._id) return;
    try {
      await api.post('/messages', { taskId: task._id, recipientId: recipient._id, content: text, type, attachment });
    } catch (err) {
      console.error('Failed to send attachment:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => sendAttachment({ name: file.name, mimeType: file.type, dataUrl: reader.result }, 'FILE');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      recorder.ondataavailable = (event) => voiceChunksRef.current.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(voiceChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => sendAttachment({ name: 'voice-note.webm', mimeType: blob.type, dataUrl: reader.result }, 'VOICE');
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone permission failed:', err);
    }
  };

  const createPeer = (mode) => {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peer.onicecandidate = ({ candidate }) => {
      if (candidate) socketRef.current?.emit('call_ice_candidate', { taskId: task._id, candidate });
    };
    peer.ontrack = ({ streams }) => {
      remoteStreamRef.current = streams[0];
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = streams[0];
    };
    peerRef.current = peer;
    return peer;
  };

  useEffect(() => {
    if (!callMode) return;
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callMode]);

  const updateCallLog = async (messageId, status) => {
    try {
      const response = await api.put(`/messages/${messageId}/call-status`, { status });
      if (response.data?.message) {
        setMessages((prev) => prev.some((message) => message._id === messageId)
          ? prev.map((message) => message._id === messageId ? response.data.message : message)
          : [...prev, response.data.message]);
      }
      return response.data?.message;
    } catch (err) {
      console.error('Failed to update call history:', err);
      return null;
    }
  };

  const getCallStream = async (mode) => {
    let stream;
    if (mode === 'video') {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (videoError) {
        console.warn('Camera unavailable, continuing with audio:', videoError);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (audioError) {
          console.warn('Microphone unavailable, continuing without local media:', audioError);
          stream = new MediaStream();
        }
        setCameraEnabled(false);
      }
    } else {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (audioError) {
        console.warn('Microphone unavailable, continuing without local media:', audioError);
        stream = new MediaStream();
        setMicEnabled(false);
      }
    }
    localStreamRef.current = stream;
    setMicEnabled(stream.getAudioTracks().some((track) => track.enabled));
    if (mode === 'video' && stream.getVideoTracks().length > 0) setCameraEnabled(true);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setMicEnabled(audioTrack.enabled);
  };

  const toggleCamera = async () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
      return;
    }

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const newVideoTrack = cameraStream.getVideoTracks()[0];
      if (!newVideoTrack || !localStreamRef.current) return;

      localStreamRef.current.addTrack(newVideoTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;

      const videoSender = peerRef.current?.getSenders().find((sender) => sender.track?.kind === 'video');
      if (videoSender) {
        await videoSender.replaceTrack(newVideoTrack);
      } else if (peerRef.current) {
        peerRef.current.addTrack(newVideoTrack, localStreamRef.current);
      }
      setCameraEnabled(true);
      setCallStatus('Camera on');
    } catch (err) {
      console.error('Unable to turn camera on:', err);
      setCameraEnabled(false);
      setCallStatus('Allow camera for this site, then tap camera again');
    }
  };

  const startCall = async (mode) => {
    setCallMode(mode);
    setCallStatus('Calling...');
    try {
      const logResponse = await api.post('/messages/call-log', {
        taskId: task._id,
        recipientId: recipient._id,
        type: mode === 'video' ? 'VIDEO_CALL' : 'VOICE_CALL',
      });
      const newCallMessage = logResponse.data.message;
      setCallMessageId(newCallMessage._id);
      const stream = await getCallStream(mode);
      const peer = createPeer(mode);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socketRef.current?.emit('call_offer', { taskId: task._id, recipientId: recipient._id, offer, mode, caller: user?.name, callerId: user?._id, callMessageId: newCallMessage._id });
      callTimerRef.current = setTimeout(async () => {
        await updateCallLog(newCallMessage._id, 'MISSED');
        setMessages((prev) => prev.map((message) => (
          message._id === newCallMessage._id ? { ...message, callStatus: 'MISSED' } : message
        )));
        endCall(false);
      }, 30000);
    } catch (err) {
      console.error('Unable to start call:', err);
      setCallStatus(mode === 'video'
        ? 'Camera or microphone unavailable'
        : 'Microphone unavailable');
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await getCallStream(incomingCall.mode);
      const peer = createPeer(incomingCall.mode);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      await peer.setRemoteDescription(incomingCall.offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socketRef.current?.emit('call_answer', { taskId: task._id, answer, callerId: incomingCall.callerId, callMessageId: incomingCall.callMessageId });
      await updateCallLog(incomingCall.callMessageId, 'ANSWERED');
      clearTimeout(callTimerRef.current);
      setCallMessageId(incomingCall.callMessageId);
      setCallMode(incomingCall.mode);
      setIncomingCall(null);
      setCallStatus('Connected');
    } catch (err) {
      console.error('Unable to accept call:', err);
    }
  };

  function endCall(notify = true) {
    if (notify && task?._id) socketRef.current?.emit('call_end', { taskId: task._id });
    if (notify && callMessageId && callStatus !== 'Connected') updateCallLog(callMessageId, 'MISSED');
    peerRef.current?.close();
    clearTimeout(callTimerRef.current);
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setCallMode(null);
    setIncomingCall(null);
    setCallStatus('');
    setCallMessageId(null);
    setMicEnabled(true);
    setCameraEnabled(true);
  }

  return (
    <>
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
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg" title="Clear chat">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg" title="Close chat">
            <X className="w-5 h-5" />
          </button>
        </div>
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
                  {['VOICE_CALL', 'VIDEO_CALL'].includes(m.type) ? (
                    <div className="flex items-center gap-2">
                      {m.type === 'VIDEO_CALL' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      <span>{m.type === 'VIDEO_CALL' ? 'Video call' : 'Voice call'} · {m.callStatus === 'ANSWERED' ? 'Answered' : m.callStatus === 'RINGING' ? 'Calling...' : 'Missed call'}</span>
                    </div>
                  ) : m.type === 'FILE' && m.attachment?.dataUrl ? (
                    <a href={m.attachment.dataUrl} download={m.attachment.name} className="flex items-center gap-2 underline">
                      <Download className="w-3.5 h-3.5" /> {m.attachment.name}
                    </a>
                  ) : m.type === 'VOICE' && m.attachment?.dataUrl ? (
                    <audio controls src={m.attachment.dataUrl} className="max-w-full" />
                  ) : m.content}
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

      {incomingCall && (
        <div className="p-3 border-t border-amber-500/30 bg-amber-950/30 flex items-center justify-between gap-2 text-xs">
          <span className="text-amber-200">{incomingCall.caller || 'Someone'} is calling</span>
          <div className="flex gap-2">
            <button onClick={acceptCall} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold">Accept</button>
            <button
              onClick={() => {
                socketRef.current?.emit('call_decline', { taskId: task._id, callerId: incomingCall.callerId, callMessageId: incomingCall.callMessageId });
                updateCallLog(incomingCall.callMessageId, 'MISSED');
                setIncomingCall(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-bold"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-slate-800 bg-slate-950">
        <button type="button" onClick={() => setWorkspaceOpen((open) => !open)} className="w-full px-4 py-3 flex items-center justify-between text-xs text-slate-200 hover:bg-slate-900">
          <span className="flex items-center gap-2 font-bold"><ListChecks className="w-4 h-4 text-sky-400" /> Collaboration workspace</span>
          <span className="text-[10px] text-slate-500">{workspace.checklist.filter((item) => item.completed).length}/{workspace.checklist.length} done</span>
        </button>
        {workspaceOpen && (
          <div className="px-4 pb-4 space-y-3">
            <textarea value={workspace.notes} onChange={(event) => setWorkspace((current) => ({ ...current, notes: event.target.value }))} placeholder="Shared notes for this task..." rows={3} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500" />
            <div className="flex gap-2"><input value={newChecklistItem} onChange={(event) => setNewChecklistItem(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addChecklistItem()} placeholder="Add a shared step..." className="min-w-0 flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500" /><button type="button" onClick={addChecklistItem} className="px-3 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold">Add</button></div>
            <div className="space-y-1.5">{workspace.checklist.map((item, index) => <label key={`${item.text}-${index}`} className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(index)} className="accent-sky-500" /> <span className={item.completed ? 'line-through text-slate-500' : ''}>{item.text}</span></label>)}</div>
            <button type="button" onClick={() => saveWorkspace()} disabled={workspaceSaving} className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"><Save className="w-3.5 h-3.5" /> {workspaceSaving ? 'Saving...' : 'Save shared notes'}</button>
          </div>
        )}
      </div>

      {callMode && (
        <div className="p-3 border-t border-emerald-500/30 bg-emerald-950/30 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span>{callMode === 'video' ? 'Video call' : 'Voice call'} · {callStatus}</span>
            <div className="flex items-center gap-1.5">
              <button onClick={toggleMic} className="p-1.5 rounded-lg bg-slate-800 text-white" title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              {callMode === 'video' && (
                <button onClick={toggleCamera} className="p-1.5 rounded-lg bg-slate-800 text-white" title={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}>
                  {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              )}
              <button onClick={() => endCall()} className="p-1.5 rounded-lg bg-rose-500 text-white" title="End call"><PhoneOff className="w-4 h-4" /></button>
            </div>
          </div>
          {callMode === 'audio' && <div className="text-xs text-slate-400">Audio call controls are active.</div>}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-emerald-400" title="Attach file"><Paperclip className="w-4 h-4" /></button>
        <button type="button" onClick={toggleRecording} className={`p-2.5 rounded-xl ${recording ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-300 hover:text-emerald-400'}`} title={recording ? 'Stop recording' : 'Send voice note'}>{recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</button>
        <button type="button" onClick={() => startCall('audio')} className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-emerald-400" title="Voice call"><Phone className="w-4 h-4" /></button>
        <button type="button" onClick={() => startCall('video')} className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-emerald-400" title="Video call"><Video className="w-4 h-4" /></button>
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
    {callMode === 'video' && (
      <div className="fixed inset-0 z-[60] bg-slate-950 text-white flex flex-col overflow-hidden">
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover bg-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between p-5 sm:p-7">
          <div>
            <p className="text-lg font-semibold">{recipient?.name || 'Video call'}</p>
            <p className="text-sm text-white/70">{callStatus}</p>
          </div>
          <button onClick={() => endCall()} className="rounded-full bg-white/15 p-3 text-white backdrop-blur-sm" title="End call">
            <X className="h-5 w-5" />
          </button>
        </div>
        <video ref={localVideoRef} autoPlay muted playsInline className="absolute right-4 top-20 z-10 h-36 w-24 rounded-2xl border border-white/40 bg-slate-900 object-cover shadow-2xl sm:right-7 sm:top-24 sm:h-48 sm:w-32" />
        {!cameraEnabled && <div className="absolute bottom-28 left-0 right-0 z-10 px-6 text-center text-sm text-white/80">Camera access is blocked. Use the browser site settings to allow Camera for localhost, then press the camera button.</div>}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-5 sm:bottom-10">
          <button onClick={toggleMic} className={`rounded-full p-4 ${micEnabled ? 'bg-white/20' : 'bg-white text-slate-950'} backdrop-blur-sm`} title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}>
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button onClick={endCall} className="rounded-full bg-rose-600 p-5 shadow-lg shadow-rose-950/50" title="End call">
            <PhoneOff className="h-6 w-6" />
          </button>
          <button onClick={toggleCamera} className={`rounded-full p-4 ${cameraEnabled ? 'bg-white/20' : 'bg-white text-slate-950'} backdrop-blur-sm`} title={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}>
            {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        </div>
      </div>
    )}
    </>
  );
}
