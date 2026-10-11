import api from "./api.js";

export const fetchMyResults = async () => {
  const res = await api.get("/results/my");
  return res.data;
};

export const fetchResultById = async (id) => {
  const res = await api.get(`/results/detail/${id}`);
  return res.data;
};

export const fetchQuizResults = async (quizId) => {
  const res = await api.get(`/results/${quizId}`);
  return res.data;
};

export const fetchLeaderboard = async (quizId) => {
  const res = await api.get(`/leaderboard/${quizId}`);
  return res.data;
};
