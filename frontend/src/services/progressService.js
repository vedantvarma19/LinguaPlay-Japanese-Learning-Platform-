import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// 🔑 Attach token to EVERY request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Get user progress
export const getProgress = () => API.get("/progress");

// Mark flashcard as known
export const markKnown = (flashcardId) =>
  API.post("/progress/known", { flashcardId });
