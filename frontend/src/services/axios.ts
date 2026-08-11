import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});

// Add token automatically if authentication is enabled
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

// =====================================================
// ML PREDICTION API
// =====================================================

export interface AllocationPrediction {
  task_id: string;
  user_id: string;
  allocation_score: number;
  status: string;
  message: string;
  encoding_verified: boolean;
}

export interface DelayPrediction {
  task_id: string;
  assigned_to: string;
  delay_prediction: number;
  status: string;
  encoding_verified: boolean;
}

export interface TimelinePrediction {
  task_id: string;
  assigned_to: string;
  estimated_completion_days: number;
  status: string;
  encoding_verified: boolean;
}

export interface RiskPrediction {
  task_id: string;
  risk_level: string;
  days_overdue: number;
  employee_workload: number;
}

export const predictAllocation = async (
  taskId: string,
  userId: string
): Promise<AllocationPrediction> => {
  const response = await api.post<AllocationPrediction>(
    `/ml/allocation/${taskId}`,
    null,
    {
      params: {
        user_id: userId,
      },
    }
  );

  return response.data;
};

export const predictDelay = async (
  taskId: string
): Promise<DelayPrediction> => {
  const response = await api.post<DelayPrediction>(
    `/ml/predict-delay/${taskId}`
  );

  return response.data;
};

export const predictTimeline = async (
  taskId: string
): Promise<TimelinePrediction> => {
  const response = await api.post<TimelinePrediction>(
    `/ml/predict-timeline/${taskId}`
  );

  return response.data;
};

export const predictRisk = async (
  taskId: string
): Promise<RiskPrediction> => {
  const response = await api.post<RiskPrediction>(
    `/ml/predict-risk/${taskId}`
  );

  return response.data;
};

export default api;