import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { 
    Heart, LogOut, LayoutDashboard, Home, Bell, 
    MessageCircle, Settings as SettingsIcon, Menu, X, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <nav className="glass sticky top-0 z-[60] px-4 md:px-8 py-3 flex justify-between items-center bg-white/60 backdrop-blur-xl border-b border-pink-50/50">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="relative">
                    <Heart className="text-romantic-red fill-romantic-red group-hover:scale-110 transition-transform duration-500" size={32} />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center"
                    >
                        <div className="w-1.5 h-1.5 bg-romantic-red rounded-full"></div>
                    </motion.div>
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-romantic-rose via-romantic-red to-romantic-purple bg-clip-text text-transparent italic tracking-tighter">
                    Mi Vida
                </span>
            </Link>

            <div className="flex items-center gap-2 md:gap-6">
                {user ? (
                    <>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-slate-600 hover:text-romantic-rose transition-colors flex items-center gap-1.5 font-bold text-sm">
                                <Home size={18} /> Home
                            </Link>
                            <Link to="/inbox" className="text-slate-600 hover:text-romantic-rose transition-colors flex items-center gap-1.5 font-bold text-sm relative">
                                <MessageCircle size={18} /> Inbox
                            </Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-slate-600 hover:text-romantic-rose transition-colors flex items-center gap-1.5 font-bold text-sm">
                                    <LayoutDashboard size={18} /> Admin
                                </Link>
                            )}
                        </div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-xl hover:bg-romantic-rose/10 transition-all text-slate-600 cursor-pointer"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-romantic-red text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-[-1]" 
                                            onClick={() => setShowNotifications(false)}
                                        ></div>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-80 glass rounded-[2rem] shadow-2xl p-4 border-none overflow-hidden"
                                        >
                                            <div className="flex justify-between items-center mb-4 px-2">
                                                <h3 className="font-black text-slate-800">Notifications</h3>
                                                <span className="text-[10px] font-black text-romantic-rose uppercase bg-romantic-rose/10 px-2 py-0.5 rounded-full">Mi Vida Moments</span>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="text-center py-8 text-slate-400 italic text-sm">No notifications yet</div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div 
                                                            key={n._id}
                                                            onClick={() => markAsRead(n._id)}
                                                            className={`p-3 rounded-2xl cursor-pointer transition-all ${n.read ? 'bg-white/30 border-transparent shadow-sm' : 'bg-white ring-1 ring-romantic-rose/10 border-transparent border-l-4 border-l-romantic-red shadow-md'}`}
                                                        >
                                                            <p className={`text-xs ${n.read ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>{n.content}</p>
                                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.date).toLocaleTimeString()}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <button 
                            onClick={logout}
                            className="bg-slate-800 text-white p-2 rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <LogOut size={18} />
                            <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Exit</span>
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="bg-gradient-to-r from-romantic-rose to-romantic-red text-white px-8 py-2.5 rounded-full font-black hover:shadow-xl hover:shadow-romantic-rose/30 transition-all">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
