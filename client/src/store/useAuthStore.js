import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: null,
    loading: true,
    token: localStorage.getItem('token') || sessionStorage.getItem('token'),
    
    init: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                set({ user: JSON.parse(jsonPayload).user, token, loading: false });
            } catch (err) {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                set({ user: null, token: null, loading: false });
            }
        } else {
            set({ loading: false });
        }
    },

    login: async (email, password, rememberMe) => {
        const res = await api.post('/auth/login', { email, password });
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', res.data.token);
        
        const base64Url = res.data.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        set({ user: JSON.parse(jsonPayload).user, token: res.data.token });
        return res.data;
    },

    register: async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);

        const base64Url = res.data.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        set({ user: JSON.parse(jsonPayload).user, token: res.data.token });
        return res.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        set({ user: null, token: null });
    }
}));

export default useAuthStore;
