import axios, { AxiosRequestConfig } from "axios";
import { HOST } from "@/config/host";

// ============================================================================
// GLOBAL MOCK API SWITCH
// ============================================================================
// When true, all services use local mock data implementations.
// When false, ZERO mock fallback occurs. Actual HTTP API requests are made.
export const USE_MOCK_API = true;

const axiosInstance = axios.create({
  baseURL: HOST.api,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mapansetu_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Centralized response parser to extract data
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Forward the error payload exactly as defined by the API contract
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get(url, config) as Promise<T>,
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post(url, data, config) as Promise<T>,
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put(url, data, config) as Promise<T>,
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.patch(url, data, config) as Promise<T>,
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete(url, config) as Promise<T>,
  interceptors: axiosInstance.interceptors,
  defaults: axiosInstance.defaults,
};

