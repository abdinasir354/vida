import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Phone, Video, MoreVertical, Paperclip, Smile, Mic, Image as ImageIcon, CheckCheck, Download, Share2, Heart, X } from 'lucide-react';

const Chat = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { conversations, messages, fetchMessages, sendMessage, socket, isTyping, currentConversation, setCurrentConversation } = useChatStore();
    const { user } = useAuthStore();
    const [input, setInput] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // Add this
    const [showAttach, setShowAttach] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const scrollRef = useRef();
    const fileInputRef = useRef();
    const timerRef = useRef();

    useEffect(() => {
        const conv = conversations.find(c => c._id === conversationId);
        if (conv) {
            setCurrentConversation(conv);
        } else {
            fetchMessages(conversationId);
        }
    }, [conversationId, conversations, setCurrentConversation, fetchMessages]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({ 
            content: input, 
            messageType: 'text',
            replyTo: replyingTo?._id 
        });
        setInput('');
        setReplyingTo(null);
    };

    const handleLike = (msgId) => {
        const { sendReaction } = useChatStore.getState();
        sendReaction(msgId, '❤️');
    };

    const handleTyping = () => {
        if (!socket || !currentConversation) return;
        const other = currentConversation.participants.find(p => p._id !== user.id);
        socket.emit('typing', { conversationId, sender: user.id, receiver: other?._id });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const type = file.type.startsWith('image') ? 'image' : 'audio';
            sendMessage({ 
                [type === 'image' ? 'imageUrl' : 'audioUrl']: res.data.url, 
                messageType: type 
            });
            setShowAttach(false);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed. Type: ' + file.type);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const res = await api.post('/chat/upload', formData);
                    sendMessage({ audioUrl: res.data.url, messageType: 'audio' });
                } catch (err) {
                    console.error('Audio upload failed', err);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            alert('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatDuration = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const emojis = ['❤️', '😘', '😍', '🌹', '💖', '✨', '🔥', '😂', '🥺', '🙏', '💯', '🥂'];

    const handleDownload = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'shared-memory-' + Date.now();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    const otherUser = currentConversation?.participants.find(p => p._id !== user.id);
    const typingUser = isTyping.get(conversationId);

    return (
        <div className="fixed inset-0 z-[9999] bg-whatsapp-bg flex flex-col h-screen overflow-hidden">
            {/* WhatsApp Header */}
            <div className="bg-whatsapp-teal text-white p-3 flex items-center justify-between shadow-md flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/inbox')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                        {otherUser?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h2 className="font-bold leading-tight">{otherUser?.name || 'Loading...'}</h2>
                        <p className="text-[11px] text-white/80">
                            {typingUser ? 'typing...' : 'online'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-5 mr-1">
                    <button className="hover:bg-white/10 p-2 rounded-full transition-colors"><Video size={20} /></button>
                    <button className="hover:bg-white/10 p-2 rounded-full transition-colors"><Phone size={20} /></button>
                    <button className="hover:bg-white/10 p-2 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Chat Area with Wallpaper */}
            <div 
                className="flex-grow overflow-y-auto p-4 space-y-2 relative"
                style={{
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundSize: '400px',
                    backgroundRepeat: 'repeat'
                }}
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                        const isMine = msg.sender === user.id;
                        const hasReaction = msg.reactions?.length > 0;
                        
                        return (
                            <motion.div
                                key={msg._id || idx}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1 group relative`}
                            >
                                <div className={`max-w-[85%] px-2.5 py-1.5 rounded-lg shadow-sm relative ${
                                    isMine ? 'bg-whatsapp-light rounded-tr-none' : 'bg-white rounded-tl-none'
                                }`}>
                                    {/* Tail */}
                                    <div className={`absolute top-0 w-2 h-3 ${isMine ? '-right-2 bg-whatsapp-light' : '-left-2 bg-white'}`} 
                                         style={{ clipPath: isMine ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }}>
                                    </div>

                                    {/* Reply Content */}
                                    {msg.replyTo && (
                                        <div className="bg-black/5 border-l-4 border-whatsapp-teal p-2 rounded mb-2 text-[12px] opacity-70">
                                            <p className="font-bold text-whatsapp-teal">Replied to:</p>
                                            <p className="truncate">{msg.replyTo.content || 'Media'}</p>
                                        </div>
                                    )}

                                    {msg.messageType === 'image' ? (
                                        <div className="space-y-1 relative group/image">
                                            <img src={msg.imageUrl} alt="Shared" className="rounded-lg max-w-full h-auto cursor-pointer hover:brightness-90 transition-all border border-slate-100/50" />
                                            <button 
                                                onClick={() => handleDownload(msg.imageUrl)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all hover:scale-110 shadow-xl backdrop-blur-sm"
                                                title="Download"
                                            >
                                                <Download size={14} />
                                            </button>
                                            {msg.content && <p className="text-[14.5px] leading-tight text-slate-800 mt-1">{msg.content}</p>}
                                        </div>
                                    ) : msg.messageType === 'audio' ? (
                                        <div className="flex items-center gap-2 min-w-[200px] py-1">
                                            <div className="w-8 h-8 rounded-full bg-whatsapp-teal text-white flex items-center justify-center shrink-0">
                                                <Mic size={16} />
                                            </div>
                                            <audio src={msg.audioUrl} controls className="h-8 w-full custom-audio" />
                                        </div>
                                    ) : (
                                        <p className="text-[14.5px] leading-tight text-slate-800 whitespace-pre-wrap">{msg.content}</p>
                                    )}

                                    {/* Reactions */}
                                    {hasReaction && (
                                        <div className="absolute -bottom-2 right-1 bg-white border border-slate-100 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm flex items-center gap-1 z-10">
                                            {msg.reactions.map((r, i) => (
                                                <span key={i}>{r.emoji}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMine && (
                                            <CheckCheck size={14} className={msg.status === 'read' ? 'text-sky-400' : 'text-slate-400'} />
                                        )}
                                    </div>
                                </div>

                                {/* Message Actions (Visible on hover) */}
                                <div className={`absolute top-0 ${isMine ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity`}>
                                    <button 
                                        onClick={() => setReplyingTo(msg)}
                                        className="p-1.5 bg-white shadow-md rounded-full text-slate-400 hover:text-whatsapp-teal transition-colors"
                                        title="Reply"
                                    >
                                        <Share2 size={16} className="rotate-180" />
                                    </button>
                                    {user.role === 'admin' && (
                                        <button 
                                            onClick={() => handleLike(msg._id)}
                                            className="p-1.5 bg-white shadow-md rounded-full text-slate-400 hover:text-romantic-red transition-colors"
                                            title="Love"
                                        >
                                            <Heart size={16} className={hasReaction ? 'fill-romantic-red text-romantic-red' : ''} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={scrollRef} />
            </div>

            {/* Reply Preview */}
            <AnimatePresence>
                {replyingTo && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mx-2 mb-1 p-3 bg-white rounded-xl shadow-lg border-l-4 border-whatsapp-teal flex items-center justify-between z-50"
                    >
                        <div className="overflow-hidden">
                            <p className="text-[12px] font-bold text-whatsapp-teal">Replying to</p>
                            <p className="text-[13px] text-slate-500 truncate">{replyingTo.content || 'Media'}</p>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="p-2 flex items-center gap-2 bg-[#f0f2f5] flex-shrink-0 relative">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept="image/*,audio/*"
                />

                <div className="flex-grow flex items-center bg-white rounded-full px-3 py-2 shadow-sm relative">
                    <button 
                        onClick={() => setShowEmojis(!showEmojis)}
                        className={`text-slate-500 p-1 hover:text-slate-700 transition-colors ${showEmojis ? 'text-whatsapp-teal' : ''}`}
                    >
                        <Smile size={24} />
                    </button>
                    
                    <AnimatePresence>
                        {showEmojis && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-16 left-0 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 flex flex-wrap gap-2 w-64 z-50"
                            >
                                {emojis.map(e => (
                                    <button 
                                        key={e} 
                                        onClick={() => { setInput(prev => prev + e); setShowEmojis(false); }}
                                        className="text-xl hover:scale-125 transition-transform p-1"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {showAttach && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                className="absolute bottom-16 left-0 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 grid grid-cols-3 gap-6 z-50"
                            >
                                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 group">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white group-hover:bg-purple-600 transition-colors shadow-lg">
                                        <ImageIcon size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Gallery</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 group">
                                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white group-hover:bg-pink-600 transition-colors shadow-lg">
                                        <Paperclip size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Docs</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 group">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors shadow-lg">
                                        <Phone size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Contact</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        onClick={() => { setShowAttach(!showAttach); setShowEmojis(false); }}
                        className={`text-slate-500 p-1 hover:text-slate-700 transition-all ${showAttach ? 'rotate-45 text-whatsapp-teal' : ''}`}
                    >
                        <Paperclip size={24} />
                    </button>
                    
                    {isRecording ? (
                        <div className="flex-grow flex items-center px-2 text-romantic-rose font-black italic animate-pulse">
                            <span className="relative flex h-3 w-3 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-romantic-rose opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-romantic-rose"></span>
                            </span>
                            Recording... {formatDuration(recordingDuration)}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleTyping}
                            placeholder="Type a message..."
                            className="flex-grow bg-transparent border-none outline-none px-2 text-[15px] text-slate-700 placeholder:text-slate-400 font-medium"
                            onFocus={() => { setShowAttach(false); setShowEmojis(false); }}
                        />
                    )}
                </div>
                
                {input.trim() ? (
                    <button 
                        onClick={handleSend}
                        className="w-12 h-12 bg-whatsapp-teal text-white rounded-full flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all shrink-0"
                    >
                        <Send size={20} />
                    </button>
                ) : (
                    <button 
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all shrink-0 ${isRecording ? 'bg-romantic-rose scale-125 animate-pulse text-white' : 'bg-whatsapp-teal text-white hover:brightness-110 active:scale-95'}`}
                    >
                        <Mic size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Chat;
