import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useChatStore from './store/useChatStore';
import Navbar from './components/Navbar';
import HeartAnimation from './components/HeartAnimation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Birthday from './pages/Birthday';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import MusicToggle from './components/MusicToggle';
import FloatingChatIcon from './components/FloatingChatIcon';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuthStore();

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-bounce text-romantic-red text-4xl">❤️</div>
        </div>
    );

    if (!user) return <Navigate to="/login" />;
    
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    const { user, init } = useAuthStore();
    const { initSocket } = useChatStore();

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (user) {
            initSocket(user.id);
        }
    }, [user, initSocket]);

    return (
        <Router>
            <div className="min-h-screen relative font-serif">
                <HeartAnimation />
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    <Route path="/inbox" element={
                        <ProtectedRoute>
                            <Inbox />
                        </ProtectedRoute>
                    } />
                    <Route path="/chat/:conversationId" element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/birthday" element={
                        <ProtectedRoute>
                            <Birthday />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                
                <footer className="relative z-10 py-8 text-center text-slate-400 text-sm">
                    Made with <span className="text-romantic-red animate-pulse inline-block">❤️</span> by Admin
                </footer>

                <MusicToggle />
                <FloatingChatIcon />
            </div>
        </Router>
    );
}

export default App;
