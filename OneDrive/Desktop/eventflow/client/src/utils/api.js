import axios from "axios";

const api = axios.create({
 
  baseURL: "https://eventflow-ns8c.onrender.com/api"
  timeout: 15000,
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
