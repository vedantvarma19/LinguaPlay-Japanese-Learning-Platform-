import API from "./api";

export const getProgress = () => API.get("/progress");
export const markKnown = (flashcardId) =>
    API.post("/progress/known", { flashcardId });