import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://datasets-z6ly.onrender.com/';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Enable if using HTTPBasic Auth
});

export default axiosInstance;

