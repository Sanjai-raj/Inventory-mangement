import axios from 'axios';

// Updated to point to the PHP built-in server started by 'npm run dev'
const API_URL = "http://127.0.0.1:8080";
// Note: 'php -S ... -t ../backend/api' sets the docroot to 'api', so URLs are relative to that.
// E.g. http://127.0.0.1:8080/auth/login.php

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
