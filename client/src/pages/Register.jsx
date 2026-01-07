import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { Heart, User, Mail, Lock, Sparkles } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: ''
    });
    const { register } = useAuthStore();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            alert('Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-romantic-rose to-romantic-red"></div>
                
                <div className="flex flex-col items-center mb-8">
                    <Sparkles className="text-romantic-rose mb-2" size={32} />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-romantic-rose to-romantic-red bg-clip-text text-transparent">
                        Create Connection ❤️
                    </h2>
                    <p className="text-slate-500 mt-2">Join "Mi Vida" Garden</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Your Name"
                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-romantic-rose transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-romantic-rose transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-romantic-rose transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full mt-4 bg-gradient-to-r from-romantic-rose to-romantic-red text-white py-3 rounded-xl font-bold hover:shadow-lg hover:brightness-110 active:scale-95 transition-all"
                    >
                        Sign Up ❤️
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-500 text-sm">
                    Already have an account? {' '}
                    <Link to="/login" className="text-romantic-rose font-bold hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
