import axios, { AxiosRequestConfig } from "axios";
import { HOST } from "@/config/host";

// ============================================================================
// GLOBAL MOCK API SWITCH
// ============================================================================
// When true, all services use local mock data implementations.
// When false, ZERO mock fallback occurs. Actual HTTP API requests are made.
export const USE_MOCK_API = false;

const axiosInstance = axios.create({
  baseURL: HOST.api,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (config.url) {
    const [path, query] = config.url.split("?");
    if (!path.endsWith("/")) {
      config.url = `${path}/${query ? `?${query}` : ""}`;
    }
  }

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
    // Convert error response objects into proper Error instances so
    // catch blocks and React error boundaries receive error.message
    // instead of rendering "[object Object]".
    if (error.response && error.response.data) {
      const data = error.response.data;
      // Extract a human-readable message from common API error shapes
      const message =
        (typeof data === "string" && data) ||
        data?.detail ||
        data?.message ||
        data?.error ||
        (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) ||
        `Request failed with status ${error.response.status}`;
      const err = new Error(typeof message === "string" ? message : JSON.stringify(message));
      // Attach the raw response data for callers that need it
      (err as Error & { data: unknown }).data = data;
      return Promise.reject(err);
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

