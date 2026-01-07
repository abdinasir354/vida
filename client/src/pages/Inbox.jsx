import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { MessageSquare, User as UserIcon, Search, MoreVertical, Camera } from 'lucide-react';

const Inbox = () => {
    const { conversations, fetchConversations, onlineUsers } = useChatStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const getOtherParticipant = (participants) => {
        return participants.find(p => p._id !== user.id);
    };

    return (
        <div className="max-w-md mx-auto h-[calc(100vh-80px)] bg-white flex flex-col shadow-2xl relative z-10">
            {/* WhatsApp Inbox Header */}
            <div className="bg-whatsapp-teal text-white p-4 flex flex-col gap-4 shadow-md">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold italic">WhatsApp</h1>
                    <div className="flex gap-6 opacity-80">
                        <Camera size={20} />
                        <Search size={20} />
                        <MoreVertical size={20} />
                    </div>
                </div>
                <div className="flex gap-4 font-black text-xs uppercase tracking-widest opacity-80">
                    <div className="pb-2 border-b-2 border-white flex-1 text-center">Chats</div>
                    <div className="pb-2 flex-1 text-center">Status</div>
                    <div className="pb-2 flex-1 text-center">Calls</div>
                </div>
            </div>

            {/* Chats List */}
            <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
                {conversations.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="font-bold italic">No chats yet...</p>
                    </div>
                ) : (
                    conversations.map((conv, index) => {
                        const other = getOtherParticipant(conv.participants);
                        const isOnline = onlineUsers.has(other?._id);

                        return (
                            <motion.div
                                key={conv._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => navigate(`/chat/${conv._id}`)}
                                className="p-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors"
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-50 font-black text-xl">
                                        {other?.name?.charAt(0) || '?'}
                                    </div>
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-whatsapp-green border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-slate-800 truncate">
                                            {other?.name || 'Unknown User'}
                                            {other?.role === 'admin' && <span className="ml-2 text-[8px] bg-romantic-rose text-white px-1.5 py-0.5 rounded-full uppercase">Me</span>}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-slate-500 truncate pr-4 italic">
                                            {conv.lastMessage?.content || 'Sent a memory...'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Fab for new chat */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-6 right-6 w-14 h-14 bg-whatsapp-green text-white rounded-2xl flex items-center justify-center shadow-xl z-20"
            >
                <MessageSquare size={24} fill="currentColor" className="text-white/20" />
            </motion.button>
        </div>
    );
};

export default Inbox;
