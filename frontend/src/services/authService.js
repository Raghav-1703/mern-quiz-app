import api from "./api.js";

export const signup = async (userData) => {
  const res = await api.post("/auth/signup", userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    // Ignore server error on logout
  }
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data.user;
};

export const becomeAdmin = async () => {
  const res = await api.post("/auth/become-admin");
  return res.data;
};
