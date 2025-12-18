import axios from 'axios';

// axios.defaults.withCredentials = true;
export const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Response interceptor để ẩn lỗi 400
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Không log 400 errors ra console
    // if (error.response?.status !== 400) {
    //   console.error('API Error:', error.response?.data || error.message);
    // }
    return Promise.reject(error);
  }
);

export default axiosInstance;
