import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
});

// Attach token automatically if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Clear stale session on authentication failure
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      localStorage.removeItem("userStreak");
      localStorage.removeItem("userAvatar");
      
      // Prevent infinite redirect loops if we are already on /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
