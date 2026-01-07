import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const FloatingChatIcon = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            const fetchAdminId = async () => {
                try {
                    const res = await api.get('/messages/admin-id');
                    setAdminId(res.data._id);
                } catch (err) {
                    console.error('Failed to fetch admin ID', err);
                }
            };
            fetchAdminId();
        }
    }, [user]);

    if (!user || user.role === 'admin' || !adminId) return null;

    const handleStartChat = async () => {
        try {
            const res = await api.post('/messages/conversation', { participantId: adminId });
            navigate(`/chat/${res.data._id}`);
            setIsOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="glass mb-4 p-6 rounded-[2rem] w-72 shadow-2xl relative border border-white/40"
                    >
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-romantic-rose transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-romantic-rose/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="text-romantic-rose" size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 italic">Need anything?</h3>
                            <p className="text-sm text-slate-500 mb-6 font-medium">
                                Message the admin privately and get a response in real-time. ❤️
                            </p>
                            <button
                                onClick={handleStartChat}
                                className="w-full bg-romantic-rose text-white py-3 rounded-2xl font-black hover:bg-romantic-red transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Send size={18} /> Start Chat
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-green-500/40 transition-all border-4 border-white"
            >
                {isOpen ? <X size={32} /> : <MessageCircle size={32} fill="currentColor" className="text-white/20" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-romantic-rose opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-romantic-rose border-2 border-white"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default FloatingChatIcon;
