// ============================================================
// src/lib/api.ts — Axios API Client
//
// This creates a single axios instance that:
// 1. Always uses the correct base URL
// 2. Automatically attaches the JWT token to every request
// 3. Handles 401 errors (auto-logout when token expires)
//
// Why use a shared instance?
//   So we don't repeat the base URL and token logic in every file.
// ============================================================

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create a configured axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout (AI calls can take time)
});

// ── Request Interceptor ─────────────────────────────────────
// Runs BEFORE every request is sent
// Automatically adds "Authorization: Bearer <token>" header
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (where we store it after login)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────
// Runs AFTER every response comes back
// Handles 401 (unauthorized) by clearing auth and redirecting
api.interceptors.response.use(
  (response) => response, // Success: just return the response
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear everything and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if we're in the browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth API calls ──────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  getMe: () => api.get("/auth/me"),
};

// ── Trip API calls ──────────────────────────────────────────
export const tripsApi = {
  getAll: () => api.get("/trips"),

  getOne: (id: string) => api.get(`/trips/${id}`),

  create: (data: object) => api.post("/trips", data),

  update: (id: string, data: object) => api.put(`/trips/${id}`, data),

  delete: (id: string) => api.delete(`/trips/${id}`),

  addActivity: (id: string, dayNumber: number, activity: object) =>
    api.patch(`/trips/${id}/activity`, { action: "add", dayNumber, activity }),

  removeActivity: (id: string, dayNumber: number, activityId: string) =>
    api.patch(`/trips/${id}/activity`, { action: "remove", dayNumber, activityId }),

  toggleFavorite: (id: string) => api.patch(`/trips/${id}/favorite`),
};

// ── AI API calls ────────────────────────────────────────────
export const aiApi = {
  generate: (tripId: string) => api.post("/ai/generate", { tripId }),

  regenerateDay: (tripId: string, dayNumber: number, instruction: string) =>
    api.post("/ai/regenerate-day", { tripId, dayNumber, instruction }),

  getHotels: (tripId: string) => api.post("/ai/hotels", { tripId }),

  getPackingList: (tripId: string) => api.post("/ai/packing-list", { tripId }),
};