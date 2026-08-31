import axios from "axios";
import { HOST } from "@/config/host";

// ============================================================================
// GLOBAL MOCK API SWITCH
// ============================================================================
// When true, all services use local mock data implementations.
// When false, ZERO mock fallback occurs. Actual HTTP API requests are made.
export const USE_MOCK_API = true;

export const api = axios.create({
  baseURL: HOST.api,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mapansetu_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Centralized response parser to extract data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Forward the error payload exactly as defined by the API contract
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);
