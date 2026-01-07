import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(true);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password, rememberMe);
            navigate('/');
        } catch (err) {
            alert('Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-romantic-rose to-romantic-red"></div>
                
                <div className="flex flex-col items-center mb-8">
                    <Heart className="text-romantic-red fill-romantic-red mb-2 heart-pulse" size={48} />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-romantic-rose to-romantic-red bg-clip-text text-transparent">
                        Welcome Back ❤️
                    </h2>
                    <p className="text-slate-500 mt-2">Log in to "Mi Vida"</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
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
                    
                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-pink-200 transition-all checked:bg-romantic-rose"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <Heart 
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                                    size={12} 
                                    fill="white"
                                />
                            </div>
                            <span className="text-sm text-slate-500 font-medium group-hover:text-romantic-rose transition-colors">Remember Me</span>
                        </label>
                        <a href="#" className="text-xs text-romantic-rose font-bold hover:underline">Forgot?</a>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-romantic-rose via-romantic-red to-romantic-purple text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-romantic-rose/20 hover:shadow-romantic-rose/40 hover:-translate-y-0.5 active:scale-95 transition-all"
                    >
                        Enter Heart ❤️
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500 text-sm">
                    Don't have an account? {' '}
                    <Link to="/register" className="text-romantic-rose font-bold hover:underline">Register here</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
