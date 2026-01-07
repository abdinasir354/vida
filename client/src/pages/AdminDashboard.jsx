import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Image as ImageIcon, MessageSquare, Heart, 
    Settings, Users, CheckCircle, XCircle, Clock, Search, Upload, Link as LinkIcon, Download
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ users: 0, contentItems: 0, images: 0, pendingEvents: 0 });
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [images, setImages] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [imageData, setImageData] = useState({ imageUrl: '', caption: '', targetUser: '', visibility: 'private', sourceType: 'url' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [approvalData, setApprovalData] = useState({ id: '', adminMessage: '' });
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const [uRes, iRes, eRes, pRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/images'),
                api.get('/events/all'),
                api.get('/posts')
            ]);
            setUsers(Array.isArray(uRes.data) ? uRes.data : []);
            setImages(Array.isArray(iRes.data) ? iRes.data : []);
            setPosts(Array.isArray(pRes.data) ? pRes.data : []);
            const eventList = Array.isArray(eRes.data) ? eRes.data : [];
            const pending = eventList.filter(e => e.status === 'pending');
            setPendingEvents(pending);
            setStats({
                users: uRes.data?.length || 0,
                contentItems: (iRes.data?.length || 0) + (pRes.data?.length || 0),
                images: iRes.data?.length || 0,
                pendingEvents: pending.length
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePost = async (id) => {
        if (window.confirm('Delete this post?')) {
            await api.delete(`/posts/${id}`);
            fetchData();
        }
    };

    const handleDeleteImage = async (id) => {
        if (window.confirm('Delete this image?')) {
            await api.delete(`/images/${id}`);
            fetchData();
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/auth/users/${editingUser._id}`, editingUser);
            setEditingUser(null);
            fetchData();
            alert('User updated! ❤️');
        } catch (err) {
            console.error(err);
        }
    };

    const handleUserStatus = async (id, status) => {
        try {
            await api.put(`/auth/users/${id}/status`, { status });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUserDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/auth/users/${id}`);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleImageSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (imageData.sourceType === 'device') {
                const formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('caption', imageData.caption);
                formData.append('visibility', imageData.visibility);
                if (imageData.targetUser) formData.append('targetUser', imageData.targetUser);
                
                res = await api.post('/images/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await api.post('/images/url', imageData);
            }
            setImageData({ imageUrl: '', caption: '', targetUser: '', visibility: 'private', sourceType: 'url' });
            setSelectedFile(null);
            alert('Image Shared! 📸');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleApproveEvent = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/events/${approvalData.id}/approve`, { adminMessage: approvalData.adminMessage });
            setApprovalData({ id: '', adminMessage: '' });
            alert('Event Approved! 🎉');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'vida-admin-save-' + Date.now();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    const handleChatWithUser = async (userId) => {
        try {
            const res = await api.post('/messages/conversation', { participantId: userId });
            navigate(`/chat/${res.data._id}`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3 italic">
                        <Settings className="text-romantic-rose animate-spin-slow" size={36} /> Admin Central
                    </h1>
                    <p className="text-slate-500 font-medium">Manage the magic of Mi Vida ❤️</p>
                </div>

                <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-2xl shadow-inner">
                    {[
                        { id: 'overview', icon: <Search size={18} />, label: 'Overview' },
                        { id: 'users', icon: <Users size={18} />, label: 'Users' },
                        { id: 'feed', icon: <ImageIcon size={18} />, label: 'Global Feed' },
                        { id: 'approvals', icon: <Clock size={18} />, label: 'Approvals' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-romantic-rose text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-romantic-rose/10'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Users', value: stats.users, icon: <Users />, color: 'bg-blue-500' },
                    { label: 'Content Items', value: stats.contentItems, icon: <Heart />, color: 'bg-romantic-red' },
                    { label: 'Images', value: stats.images, icon: <ImageIcon />, color: 'bg-purple-500' },
                    { label: 'Pending', value: stats.pendingEvents, icon: <Clock />, color: 'bg-orange-500' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-6 rounded-[2rem] flex items-center gap-4 relative overflow-hidden"
                    >
                        <div className={`${stat.color} p-4 rounded-2xl text-white shadow-xl relative z-10`}>
                            {stat.icon}
                        </div>
                        <div className="relative z-10">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                        </div>
                        <div className={`absolute -right-4 -bottom-4 ${stat.color} opacity-5 rounded-full w-24 h-24`}></div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {/* Instant Chat Shortcut */}
                        <div className="glass p-8 rounded-[2.5rem]">
                            <h2 className="text-2xl font-black text-slate-700 mb-6 flex items-center gap-2">
                                <MessageSquare className="text-romantic-rose" /> Quick Connection
                            </h2>
                            <div className="space-y-4">
                                <p className="text-slate-500 text-sm">Select a user to start a secure real-time chat.</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {users.filter(u => u.role !== 'admin').map(u => (
                                        <button 
                                            key={u._id}
                                            onClick={() => handleChatWithUser(u._id)}
                                            className="w-full p-4 rounded-2xl bg-white/50 hover:bg-romantic-rose/5 border border-pink-50 flex justify-between items-center group transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-romantic-rose/10 flex items-center justify-center font-bold text-romantic-rose">
                                                    {u.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="font-bold text-slate-700">{u.name}</span>
                                            </div>
                                            <MessageSquare size={18} className="text-slate-300 group-hover:text-romantic-rose" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Image Share Form */}
                        <div className="glass p-8 rounded-[2.5rem]">
                            <h2 className="text-2xl font-black text-slate-700 mb-6 flex items-center gap-2">
                                <ImageIcon className="text-purple-500" /> Share Exclusive Memory
                            </h2>
                            <form onSubmit={handleImageSubmit} className="space-y-4">
                                <div className="flex gap-4 mb-2">
                                    <button 
                                        type="button"
                                        onClick={() => setImageData({...imageData, sourceType: 'url'})}
                                        className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${imageData.sourceType === 'url' ? 'bg-purple-500 text-white' : 'bg-white text-slate-400'}`}
                                    >
                                        <LinkIcon size={14} /> URL
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setImageData({...imageData, sourceType: 'device'})}
                                        className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${imageData.sourceType === 'device' ? 'bg-purple-500 text-white' : 'bg-white text-slate-400'}`}
                                    >
                                        <Upload size={14} /> Device
                                    </button>
                                </div>

                                {imageData.sourceType === 'url' ? (
                                    <input 
                                        type="text" 
                                        placeholder="Image URL"
                                        className="w-full p-4 rounded-2xl bg-white/50 border border-pink-50 focus:ring-2 focus:ring-purple-400 outline-none"
                                        value={imageData.imageUrl}
                                        onChange={(e) => setImageData({...imageData, imageUrl: e.target.value})}
                                        required
                                    />
                                ) : (
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="w-full p-3 rounded-2xl bg-white/50 border border-pink-50 outline-none"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        required
                                    />
                                )}
                                <input 
                                    type="text" 
                                    placeholder="Caption"
                                    className="w-full p-4 rounded-2xl bg-white/50 border border-pink-50 focus:ring-2 focus:ring-purple-400 outline-none"
                                    value={imageData.caption}
                                    onChange={(e) => setImageData({...imageData, caption: e.target.value})}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <select 
                                        className="p-4 rounded-2xl bg-white/50 border border-pink-50 outline-none font-bold text-sm"
                                        value={imageData.targetUser}
                                        onChange={(e) => setImageData({...imageData, targetUser: e.target.value})}
                                    >
                                        <option value="">Public (For All)</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name}</option>
                                        ))}
                                    </select>
                                    <button className="bg-purple-500 text-white py-4 rounded-2xl font-black hover:bg-purple-600 transition-all shadow-lg active:scale-95">
                                        Post Memory 📸
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div 
                        key="users"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {editingUser && (
                            <form onSubmit={handleUpdateUser} className="glass p-6 rounded-[2rem] flex flex-wrap gap-4 items-center border-romantic-rose/20 shadow-xl">
                                <h4 className="font-black text-slate-700 italic flex items-center gap-2 w-full mb-2">
                                    <Settings size={18} className="text-romantic-rose" /> Edit User Session
                                </h4>
                                <input 
                                    className="flex-1 min-w-[200px] p-3 rounded-full bg-white/50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-romantic-rose font-bold"
                                    value={editingUser.name}
                                    placeholder="Name"
                                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                />
                                <input 
                                    className="flex-1 min-w-[200px] p-3 rounded-full bg-white/50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-romantic-rose font-bold"
                                    value={editingUser.email}
                                    placeholder="Email"
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                />
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button type="submit" className="flex-1 bg-whatsapp-teal text-white px-8 py-3 rounded-full font-black shadow-lg">Save</button>
                                    <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-200 text-slate-600 px-8 py-3 rounded-full font-black">Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="glass rounded-[2.5rem] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="p-6 text-slate-500 font-bold uppercase text-xs">User</th>
                                        <th className="p-6 text-slate-500 font-bold uppercase text-xs">Joined</th>
                                        <th className="p-6 text-slate-500 font-bold uppercase text-xs">Status</th>
                                        <th className="p-6 text-slate-500 font-bold uppercase text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-bold">
                                    {users.map(u => (
                                        <tr key={u._id} className="hover:bg-white/40 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-romantic-rose/20 flex items-center justify-center text-romantic-rose font-black">
                                                        {u.name?.charAt(0) || 'V'}
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-800">{u.name}</p>
                                                        <p className="text-sm text-slate-500 font-medium">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-slate-500 text-sm">
                                                {new Date(u.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right space-x-2">
                                                {u.role !== 'admin' && (
                                                    <>
                                                        <button 
                                                            onClick={() => setEditingUser(u)}
                                                            className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
                                                            title="Edit Details"
                                                        >
                                                            <Settings size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleChatWithUser(u._id)}
                                                            className="p-2 rounded-xl bg-romantic-rose/10 text-romantic-rose hover:bg-romantic-rose hover:text-white transition-all"
                                                            title="WhatsApp Chat"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUserStatus(u._id, u.status === 'active' ? 'disabled' : 'active')}
                                                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                                            title={u.status === 'active' ? 'Disable' : 'Enable'}
                                                        >
                                                            {u.status === 'active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUserDelete(u._id)}
                                                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all font-bold"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'feed' && (
                    <motion.div 
                        key="feed"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {/* Posts Management */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-800 italic flex items-center gap-2">
                                <Heart className="text-romantic-rose" /> All Journal Thoughts
                            </h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                {posts.map(post => (
                                    <div key={post._id} className="glass p-6 rounded-[2rem] flex justify-between items-start border-white/60 shadow-lg hover:shadow-xl transition-all">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    {post.name?.charAt(0)}
                                                </div>
                                                <p className="font-black text-slate-700 text-sm">{post.name}</p>
                                                <span className="text-[10px] text-slate-400">• {new Date(post.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-600 italic text-base leading-relaxed">"{post.text}"</p>
                                        </div>
                                        <button onClick={() => handleDeletePost(post._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Images Management */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-800 italic flex items-center gap-2">
                                <ImageIcon className="text-purple-500" /> Shared Memories
                            </h3>
                            <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                {images.map(img => (
                                    <div key={img._id} className="relative group rounded-[2rem] overflow-hidden aspect-square shadow-xl border-4 border-white">
                                        <img src={img.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleDownload(img.imageUrl)}
                                                className="bg-white text-blue-500 p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                title="Download"
                                            >
                                                <Download size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteImage(img._id)}
                                                className="bg-white text-red-500 p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'approvals' && (
                    <motion.div 
                        key="approvals"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {pendingEvents.length === 0 ? (
                            <div className="glass p-12 rounded-[2.5rem] text-center text-slate-400">
                                <CheckCircle className="mx-auto mb-4 opacity-30" size={64} />
                                <p className="text-xl font-bold italic">All special dates are approved! ❤️</p>
                            </div>
                        ) : (
                            pendingEvents.map(event => (
                                <div key={event._id} className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-2 h-full bg-romantic-rose/20"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 rounded-full bg-romantic-rose/10 text-romantic-rose text-xs font-black uppercase">
                                                {event.type} Request
                                            </span>
                                            <span className="text-slate-400 text-xs">• {new Date(event.date).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 mb-2">
                                            {event.user?.name || 'Someone'}'s Special Day
                                        </h3>
                                        <p className="text-slate-600 mb-4 italic">
                                            Category: <span className="font-bold text-romantic-rose uppercase">{event.category}</span><br/>
                                            Date: <span className="font-bold text-slate-800">{new Date(event.targetDate).toLocaleDateString()}</span>
                                        </p>
                                        
                                        <form 
                                            onSubmit={handleApproveEvent}
                                            className="flex gap-4"
                                            onFocus={() => setApprovalData({...approvalData, id: event._id})}
                                        >
                                            <input 
                                                type="text" 
                                                placeholder="Write the surprise message for this day..."
                                                className="flex-1 p-4 rounded-full bg-white/50 border border-pink-100 focus:ring-2 focus:ring-romantic-rose outline-none transition-all font-bold"
                                                value={approvalData.id === event._id ? approvalData.adminMessage : ''}
                                                onChange={(e) => setApprovalData({id: event._id, adminMessage: e.target.value})}
                                                required
                                            />
                                            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 rounded-full font-black hover:shadow-lg active:scale-95 transition-all">
                                                Approve
                                            </button>
                                        </form>
                                    </div>
                                    <div className="hidden md:flex w-32 h-32 rounded-3xl bg-romantic-rose/5 items-center justify-center">
                                        <Clock className="text-romantic-rose/30" size={48} />
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
