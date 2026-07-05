import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../constant";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
      const navigate = useNavigate();

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate(PATHS.dashboard);
    }
    return Promise.reject(error);
  },
);

export default api;
