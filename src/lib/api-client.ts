import axios, { AxiosInstance } from 'axios';
import https from 'https';

// Define API endpoints
export const API_ENDPOINTS = {
  ROLE: '/api/proxy/role',
  COURSES: '/api/proxy/courses',
  // Add other endpoints as needed
};

// Create HTTPS agent for self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: httpsAgent,
});

// Add request interceptor to include cookies
apiClient.interceptors.request.use((config) => {
  // You can add auth headers here if needed
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle errors
// Note: 401 handling is done globally by AuthProvider
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
);

export { apiClient };
