import axios from "axios";
import { PATHS } from "../constant";
import { navigate } from "../utils/navigate";
import { store } from "../store/store";
import { logout } from "../store/reducer/authReducer";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Tăng timeout lên 60s vì backend Render free tier cần thời gian wake up
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      navigate(PATHS.dashboard);
    }
    return Promise.reject(error);
  },
);

export default api;