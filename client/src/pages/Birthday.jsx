import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Cake, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';


const Birthday = () => {
    useEffect(() => {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-10 overflow-hidden">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="mb-8"
            >
                <div className="relative">
                    <Cake className="text-romantic-red" size={120} />
                    <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-10 -right-10"
                    >
                        <Sparkles className="text-yellow-400" size={64} />
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass p-12 rounded-[3rem] max-w-2xl shadow-2xl relative border-none"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-romantic-rose/10 to-transparent rounded-[3rem]"></div>
                
                <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-romantic-rose via-romantic-red to-romantic-purple bg-clip-text text-transparent italic mb-6">
                    Happy Birthday <br/> My Mi Vida 🎉💖
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed mb-8 italic">
                    "Every year with you is a gift I never knew I deserved. Today, the world celebrates the day its most beautiful soul was born. I love you more than words can ever say."
                </p>

                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-romantic-rose to-romantic-red text-white px-8 py-4 rounded-full font-bold shadow-xl cursor-default"
                >
                    <Gift /> For My Forever Love
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Birthday;
