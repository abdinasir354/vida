import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Smile, MessageCircle, Star } from 'lucide-react';

const moodIcons = {
    happy: <Smile className="text-yellow-400" />,
    love: <Heart className="text-romantic-red fill-romantic-red" />,
    miss: <Star className="text-blue-400" />,
    smile: <MessageCircle className="text-green-400" />
};

const MessageCard = ({ message }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="glass p-6 rounded-2xl mb-6 relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-700">{message.title}</h3>
                <div className="bg-white/50 p-2 rounded-full shadow-inner">
                    {moodIcons[message.mood] || moodIcons.love}
                </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed italic">
                "{message.text}"
            </p>

            <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                <span>By {message.user?.name || 'Someone Special'}</span>
                <span>{new Date(message.date).toLocaleDateString()}</span>
            </div>

            <div className="absolute -bottom-2 -right-2 opacity-5">
                <Heart size={80} className="text-romantic-rose fill-romantic-rose" />
            </div>
        </motion.div>
    );
};

export default MessageCard;
