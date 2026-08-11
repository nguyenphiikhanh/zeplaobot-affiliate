import axios from 'axios';

// Create an axios instance
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Let the browser generate the multipart boundary for native FormData uploads.
        if (config.data instanceof FormData) {
            config.headers.setContentType(false);
        }

        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors here (e.g. 401 Unauthorized)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Could also redirect to login page here if needed
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
