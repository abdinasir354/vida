import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, Send, Image as ImageIcon, MessageCircle, 
    Gift, Calendar, Lock, Globe, Ghost, Plus, Settings, Upload, Link as LinkIcon
} from 'lucide-react';
import Gallery from '../components/Gallery';

const Home = () => {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState([]);
    const [images, setImages] = useState([]);
    const [events, setEvents] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [imgForm, setImgForm] = useState({ imageUrl: '', caption: '', targetUser: '', visibility: 'private', sourceType: 'url' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState('wall'); // wall, gallery, settings
    const [activeEvent, setActiveEvent] = useState(null);
    const [eventFormData, setEventFormData] = useState({ type: 'anniversary', targetDate: '', category: 'love' });
    const [timeTogether, setTimeTogether] = useState('');

    useEffect(() => {
        fetchData();
        checkSpecialDay();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        try {
            const [pRes, iRes, rRes] = await Promise.all([
                api.get('/posts'),
                api.get('/images'),
                api.get('/auth/recipients')
            ]);
            setPosts(pRes.data);
            setImages(iRes.data);
            setRecipients(rRes.data.filter(r => r._id !== user.id));
        } catch (err) {
            console.error(err);
        }
    };

    const checkSpecialDay = async () => {
        try {
            const res = await api.get('/events/check-today');
            if (res.data) {
                setActiveEvent(res.data);
            }
            const allEvents = await api.get('/events/me');
            setEvents(allEvents.data);
        } catch (err) {
            console.error(err);
        }
    };

    const calculateTime = () => {
        const approvedAnniversary = events.find(e => e.type === 'anniversary' && e.status === 'approved');
        const anniversaryDate = approvedAnniversary ? new Date(approvedAnniversary.targetDate) : new Date('2024-01-07');
        
        const now = new Date();
        const diff = now - anniversaryDate;
        
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeTogether(`${years}Y ${days}D ${hours}h ${minutes}m ${seconds}s`);
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/posts', { text: newPost });
            setPosts([res.data, ...posts]);
            setNewPost('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (imgForm.sourceType === 'device') {
                const formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('caption', imgForm.caption);
                formData.append('visibility', imgForm.visibility);
                if (imgForm.targetUser) formData.append('targetUser', imgForm.targetUser);
                
                res = await api.post('/images/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await api.post('/images/url', imgForm);
            }
            setImages([res.data, ...images]);
            setImgForm({ imageUrl: '', caption: '', targetUser: '', visibility: 'private', sourceType: 'url' });
            setSelectedFile(null);
            alert('Memory shared! 📸');
        } catch (err) {
            console.error(err);
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', eventFormData);
            alert('Special date submitted! Admin will set your surprise message soon. ❤️');
            setEventFormData({ type: 'anniversary', targetDate: '', category: 'love' });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
            {/* Surprise Overlay */}
            <AnimatePresence>
                {activeEvent && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-romantic-red/95 backdrop-blur-lg flex flex-col items-center justify-center text-white p-6"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-center max-w-2xl"
                        >
                            <Heart size={100} className="mx-auto mb-8 fill-white heart-pulse" />
                            <h2 className="text-5xl md:text-7xl font-black italic mb-8">
                                Happy {activeEvent.type}! ❤️
                            </h2>
                            <p className="text-2xl md:text-4xl font-bold leading-relaxed serif mb-12 italic">
                                "{activeEvent.adminMessage}"
                            </p>
                            <button 
                                onClick={() => setActiveEvent(null)}
                                className="bg-white text-romantic-red px-12 py-4 rounded-full font-black text-xl hover:scale-110 transition-transform shadow-2xl"
                            >
                                Forever Yours
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header & Counter */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-10 rounded-[3rem] text-center mb-10 border-white/40 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Heart size={120} />
                </div>
                <Heart className="mx-auto text-romantic-red fill-romantic-red mb-6 heart-pulse" size={50} />
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 italic mb-4">Together Mi Vida</h1>
                <div className="bg-white/40 py-3 px-6 rounded-full inline-block backdrop-blur-md border border-white/50">
                    <p className="text-romantic-rose font-black text-xl font-mono tracking-widest">{timeTogether}</p>
                </div>
            </motion.div>

            {/* Private Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 font-bold">
                {[
                    { id: 'wall', icon: <Globe size={18} />, label: 'Journal' },
                    { id: 'gallery', icon: <ImageIcon size={18} />, label: 'Gallery' },
                    { id: 'settings', icon: <Calendar size={18} />, label: 'Our Dates' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-romantic-rose text-white shadow-xl scale-105' : 'bg-white/50 text-slate-500 hover:bg-romantic-rose/10'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'wall' && (
                    <motion.div
                        key="wall"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <form onSubmit={handlePostSubmit} className="glass p-8 rounded-[2.5rem] flex gap-4 shadow-2xl border-white/50 group focus-within:ring-2 focus-within:ring-romantic-rose transition-all">
                            <input 
                                type="text"
                                placeholder="Write a private thought..."
                                className="flex-1 bg-white/50 border-none focus:ring-0 rounded-2xl px-6 outline-none transition-all font-medium text-lg italic"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                            />
                            <button type="submit" className="bg-gradient-to-r from-romantic-rose to-romantic-red text-white p-5 rounded-[1.5rem] hover:scale-110 transition-all shadow-lg active:scale-95">
                                <Send size={24} />
                            </button>
                        </form>

                        {posts.length === 0 ? (
                            <div className="text-center py-20 glass rounded-[2.5rem] text-slate-400">
                                <Ghost className="mx-auto mb-4 opacity-30" size={64} />
                                <p className="font-bold italic">No private thoughts yet.</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <motion.div 
                                    key={post._id}
                                    className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl group relative overflow-hidden bg-gradient-to-br from-white/60 to-pink-50/40 hover:shadow-romantic-rose/20 transition-all duration-500"
                                    layout
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-romantic-rose/20 flex items-center justify-center font-black text-romantic-rose">
                                                {post.name?.charAt(0) || 'V'}
                                            </div>
                                            <span className="font-black text-slate-800">{post.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tighter">
                                            <Lock size={12} /> Private
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">{post.text}</p>
                                    <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                                        <span>{new Date(post.date).toLocaleDateString()}</span>
                                        <Heart className="text-romantic-rose/20 group-hover:text-romantic-red transition-all" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'gallery' && (
                    <motion.div
                        key="gallery"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <form onSubmit={handleImageSubmit} className="glass p-8 rounded-[2.5rem] space-y-4 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <ImageIcon className="text-romantic-rose" />
                                <h3 className="font-black text-slate-800 italic">Share a Memory</h3>
                            </div>
                            
                            <div className="flex gap-4 mb-4">
                                <button 
                                    type="button"
                                    onClick={() => setImgForm({...imgForm, sourceType: 'url'})}
                                    className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${imgForm.sourceType === 'url' ? 'bg-romantic-rose text-white' : 'bg-white/50 text-slate-500'}`}
                                >
                                    <LinkIcon size={18} /> URL
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setImgForm({...imgForm, sourceType: 'device'})}
                                    className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${imgForm.sourceType === 'device' ? 'bg-romantic-rose text-white' : 'bg-white/50 text-slate-500'}`}
                                >
                                    <Upload size={18} /> Device
                                </button>
                            </div>

                            {imgForm.sourceType === 'url' ? (
                                <input 
                                    type="text"
                                    placeholder="Paste image URL here..."
                                    className="w-full p-4 rounded-2xl bg-white/50 border border-pink-100 outline-none focus:ring-2 focus:ring-romantic-rose font-medium text-sm"
                                    value={imgForm.imageUrl}
                                    onChange={(e) => setImgForm({...imgForm, imageUrl: e.target.value})}
                                    required
                                />
                            ) : (
                                <input 
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-3 rounded-2xl bg-white/50 border border-pink-100 outline-none focus:ring-2 focus:ring-romantic-rose font-medium text-sm"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    required
                                />
                            )}
                            
                            <input 
                                type="text"
                                placeholder="Add a sweet caption..."
                                className="w-full p-4 rounded-2xl bg-white/50 border border-pink-100 outline-none focus:ring-2 focus:ring-romantic-rose font-medium text-sm"
                                value={imgForm.caption}
                                onChange={(e) => setImgForm({...imgForm, caption: e.target.value})}
                                required
                            />

                            <div className="flex gap-4">
                                <select 
                                    className="flex-1 p-4 rounded-2xl bg-white/50 border border-pink-100 outline-none font-bold text-sm"
                                    value={imgForm.targetUser}
                                    onChange={(e) => setImgForm({...imgForm, targetUser: e.target.value})}
                                >
                                    <option value="">Public to all members</option>
                                    {recipients.map(r => <option key={r._id} value={r._id}>Only for {r.name}</option>)}
                                </select>
                                <button type="submit" className="bg-gradient-to-r from-romantic-rose to-romantic-red text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-lg active:scale-95">
                                    Post 📸
                                </button>
                            </div>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {images.map(img => (
                                <motion.div 
                                    key={img._id} 
                                    className="glass rounded-[2.5rem] overflow-hidden group shadow-2xl relative"
                                    layout
                                >
                                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                                        <img 
                                            src={img.imageUrl.startsWith('http') ? img.imageUrl : `http://localhost:5000${img.imageUrl}`} 
                                            alt={img.caption} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                            <p className="text-white font-black text-2xl italic mb-1">{img.caption}</p>
                                            <div className="flex items-center gap-2 text-romantic-rose font-bold text-xs uppercase italic">
                                                <Heart size={14} fill="currentColor" /> Shared {new Date(img.createdAt || img.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass p-10 rounded-[3rem] border-white/40"
                    >
                        <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 italic">
                            <Settings className="text-romantic-rose" /> Manage Our Special Dates
                        </h2>
                        <form onSubmit={handleEventSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-4">Type of Celebration</label>
                                    <select 
                                        className="w-full p-4 rounded-[1.5rem] bg-white/50 border border-pink-100 outline-none font-bold"
                                        value={eventFormData.type}
                                        onChange={(e) => setEventFormData({...eventFormData, type: e.target.value})}
                                    >
                                        <option value="anniversary">Anniversary</option>
                                        <option value="birthday">Birthday</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-4">The Date</label>
                                    <input 
                                        type="date"
                                        className="w-full p-4 rounded-[1.5rem] bg-white/50 border border-pink-100 outline-none font-bold"
                                        value={eventFormData.targetDate}
                                        onChange={(e) => setEventFormData({...eventFormData, targetDate: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <button className="w-full bg-gradient-to-r from-romantic-rose to-romantic-red text-white py-5 rounded-[1.5rem] font-black text-lg hover:shadow-xl shadow-romantic-rose/40 transition-all active:scale-95">
                                Request Surprise Logic ❤️
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
