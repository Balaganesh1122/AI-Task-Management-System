import axios from "axios";
import { getMockResponse } from "./mockData";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

// ---------------------------------------------------------------------------
// Request interceptor — if backend is unavailable, return mock data instantly
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const method = (config.method ?? "get").toLowerCase();

  // Only intercept read-style requests for mock data; mutations return success
  const mock = getMockResponse(url);
  if (mock !== null || method !== "get") {
    // Cancel the real network request and resolve with mock data
    const controller = new AbortController();
    controller.abort();
    config.signal = controller.signal;
    // Attach mock to config so the response interceptor can pick it up
    (config as any).__mock = method === "get" ? mock : { success: true };
  }

  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — serve mock on abort (our cancelled requests)
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config as any;

    // Our intentional abort — return mock
    if (axios.isCancel(error) && config?.__mock !== undefined) {
      return Promise.resolve({ data: config.__mock, status: 200, statusText: "OK (mock)", headers: {}, config });
    }

    // Network/backend error — try to serve mock as fallback
    if (config?.url) {
      const mock = getMockResponse(config.url);
      if (mock !== null) {
        console.warn(`[Mock Fallback] ${config.method?.toUpperCase()} ${config.url}`);
        return Promise.resolve({ data: mock, status: 200, statusText: "OK (mock fallback)", headers: {}, config });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
