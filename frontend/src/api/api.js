import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const fetchQuizzes = (category) =>
  api.get("/quizzes", { params: category ? { category } : {} }).then((r) => r.data);

export const fetchQuiz = (id) => api.get(`/quizzes/${id}`).then((r) => r.data);

export const submitQuiz = (id, payload) =>
  api.post(`/quizzes/${id}/submit`, payload).then((r) => r.data);

export const fetchLeaderboard = (id) =>
  api.get(`/quizzes/${id}/leaderboard`).then((r) => r.data);

export default api;
