import axios from 'axios';

const api = axios.create({
    baseURL: window.location.origin.includes('localhost') 
        ? 'http://localhost:5000/api' 
        : '/api'
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
