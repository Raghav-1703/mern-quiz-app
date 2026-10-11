import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("quiz_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: intercept auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on authentication failure
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/signup" && currentPath !== "/") {
        localStorage.removeItem("quiz_token");
        localStorage.removeItem("quiz_user");
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
