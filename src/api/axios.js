import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// =======================================
// RESPONSE INTERCEPTOR
// =======================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if ( 
      error.response?.status === 401 ||
      (error.response?.status === 404 && error.response?.data?.message === "API Route Not Found") ||
      (error.response?.status === 500 && error.response?.data?.message === "Error fetching menu") ||
      (error.response?.status === 500 && error.response?.data?.message === "Loading menu")
    ) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;