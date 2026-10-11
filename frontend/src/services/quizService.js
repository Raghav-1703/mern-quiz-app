import api from "./api.js";

export const fetchQuizzes = async (params) => {
  const res = await api.get("/quizzes", { params });
  return res.data;
};

export const fetchQuizById = async (id) => {
  const res = await api.get(`/quizzes/${id}`);
  return res.data;
};

export const joinQuizByCode = async (quizCode) => {
  const res = await api.post("/quizzes/join", { quizCode });
  return res.data;
};

export const fetchQuizAttempt = async (id) => {
  const res = await api.get(`/quizzes/${id}/attempt`);
  return res.data;
};

export const submitQuizAnswers = async (id, answersPayload) => {
  const res = await api.post(`/quizzes/${id}/submit`, answersPayload);
  return res.data;
};

export const createQuiz = async (quizData) => {
  const res = await api.post("/quizzes", quizData);
  return res.data;
};

export const deleteQuiz = async (id) => {
  const res = await api.delete(`/quizzes/${id}`);
  return res.data;
};

export const fetchAdminQuizzes = async () => {
  const res = await api.get("/quizzes/admin/my");
  return res.data;
};

export const fetchEnrolledQuizzes = async () => {
  const res = await api.get("/quizzes/enrolled");
  return res.data;
};
