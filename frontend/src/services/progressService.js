import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
});

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getProgress = () => API.get("/progress");
export const markKnown = (flashcardId) =>
    API.post("/progress/known", { flashcardId });