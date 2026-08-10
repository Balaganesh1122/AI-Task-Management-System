import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";

// ---------------------------------------------------------
// Generic GET helper
// ---------------------------------------------------------

const fetcher = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};

// ---------------------------------------------------------
// Dashboard
// ---------------------------------------------------------

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const { data: analytics } = await api.get(
        "/analytics/dashboard"
      );

      const { data: tasks } = await api.get("/tasks/");

      return {
        ...analytics,
        tasks: Array.isArray(tasks) ? tasks : [],
      };
    },
  });

export const useProductivityStats = () =>
  useQuery({
    queryKey: ["dashboard", "productivity"],
    queryFn: () => fetcher("/analytics/productivity"),
  });

// ---------------------------------------------------------
// Users
// ---------------------------------------------------------

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/users/");

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((user: any) => ({
        ...user,

        // Backend currently stores skills as a comma-separated string.
        // Convert it to an array for the frontend.
        skills: Array.isArray(user.skills)
          ? user.skills
          : typeof user.skills === "string"
            ? user.skills
                .split(",")
                .map((skill: string) => skill.trim())
                .filter(Boolean)
            : [],
      }));
    },
  });
// ---------------------------------------------------------
// Tasks
// ---------------------------------------------------------

export const useTasks = (filters?: any) =>
  useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.status) {
        params.append("status", filters.status);
      }

      if (filters?.priority) {
        params.append("priority", filters.priority);
      }

      if (filters?.assigned_to) {
        params.append("assigned_to", filters.assigned_to);
      }

      if (filters?.project_id) {
        params.append("project_id", filters.project_id);
      }

      const query = params.toString();

      return fetcher(
        `/tasks/${query ? `?${query}` : ""}`
      );
    },
  });

export const useTask = (id: string) =>
  useQuery({
    queryKey: ["tasks", id],
    queryFn: () => fetcher(`/tasks/${id}`),
    enabled: !!id,
  });

// ---------------------------------------------------------
// Create Task
// ---------------------------------------------------------

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTask: any) =>
      api.post("/tasks/", newTask),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};

// ---------------------------------------------------------
// AI Task Creation
// ---------------------------------------------------------

export const useCreateTaskFromText = () =>
  useMutation({
    mutationFn: (text: string) =>
      api.post("/tasks/create-from-text", {
        text,
      }),
  });

// ---------------------------------------------------------
// Update Task Status
// Backend:
// PUT /api/tasks/{task_id}/status
// ---------------------------------------------------------

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      progress,
    }: {
      id: string;
      status: string;
      progress?: number;
    }) =>
      api.put(`/tasks/${id}/status`, {
        status,
        ...(typeof progress === "number" ? { progress } : {}),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};

// ---------------------------------------------------------
// Update Task
// Backend:
// PUT /api/tasks/{task_id}
// ---------------------------------------------------------

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) =>
      api.put(`/tasks/${id}`, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};

// ---------------------------------------------------------
// Manual Assignment
// Backend:
// PUT /api/tasks/{task_id}/manual-assign
//
// Backend expects:
// {
//   "assigned_to": "UUID",
//   "reason": "string"
// }
// ---------------------------------------------------------

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      assigneeId,
      reason,
    }: {
      taskId: string;
      assigneeId: string;
      reason: string;
    }) =>
      api.put(`/tasks/${taskId}/manual-assign`, {
        assigned_to: assigneeId,
        reason,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};

// ---------------------------------------------------------
// Auto Assignment
// Backend:
// POST /api/tasks/auto-assign
// ---------------------------------------------------------

export const useAutoAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
    }: {
      taskId: string;
    }) =>
      api.post("/tasks/auto-assign", {
        task_id: taskId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};

// ---------------------------------------------------------
// Escalate Task
// Backend:
// POST /api/tasks/{task_id}/escalate
//
// Backend expects:
// {
//   "reason": "string"
// }
// ---------------------------------------------------------

export const useEscalateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      reason,
    }: {
      taskId: string;
      reason: string;
    }) =>
      api.post(`/tasks/${taskId}/escalate`, {
        reason,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks", "overdue"],
      });
    },
  });
};

// ---------------------------------------------------------
// Task History
// Backend:
// GET /api/tasks/{task_id}/history
// ---------------------------------------------------------

export const useTaskTimeline = (id: string) =>
  useQuery({
    queryKey: ["tasks", id, "timeline"],
    queryFn: () =>
      fetcher(`/tasks/${id}/history`),
    enabled: !!id,
  });

// ---------------------------------------------------------
// Overdue Tasks
// Backend:
// GET /api/tasks/overdue
// ---------------------------------------------------------

export const useOverdueTasks = () =>
  useQuery({
    queryKey: ["tasks", "overdue"],
    queryFn: () =>
      fetcher("/tasks/overdue"),
  });

// ---------------------------------------------------------
// Overdue Predictions
// Backend:
// GET /api/tasks/overdue/predictions
// ---------------------------------------------------------

export const useOverduePredictions = () =>
  useQuery({
    queryKey: [
      "tasks",
      "overdue",
      "predictions",
    ],
    queryFn: () =>
      fetcher("/tasks/overdue/predictions"),
  });

// ---------------------------------------------------------
// Reports
// ---------------------------------------------------------

export const useReports = () =>
  useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [dailyResponse, weeklyResponse] = await Promise.all([
        api.get("/reports/daily"),
        api.get("/reports/weekly"),
      ]);

      return {
        daily: dailyResponse.data,
        weekly: weeklyResponse.data,

        dailySummary: dailyResponse.data?.summary || {
          total_tasks: 0,
          completed: 0,
          pending: 0,
          in_progress: 0,
          overdue: 0,
        },

        weeklySummary: weeklyResponse.data?.summary || {
          total_tasks: 0,
          completed: 0,
          pending: 0,
          in_progress: 0,
          overdue: 0,
        },
      };
    },
  });

// ---------------------------------------------------------
// AI Recommendations
//
// IMPORTANT:
// GET /recommendations/ was causing 405.
// Backend provides:
// GET  /recommendations/today
// GET  /recommendations/history
// POST /recommendations/
// ---------------------------------------------------------

export const useAIRecommendations = () =>
  useQuery({
    queryKey: ["recommendations", "today"],
    queryFn: () =>
      fetcher("/recommendations/today"),
  });

export const useRecommendationHistory = () =>
  useQuery({
    queryKey: ["recommendations", "history"],
    queryFn: () =>
      fetcher("/recommendations/history"),
  });

// ---------------------------------------------------------
// Create AI Recommendation
// ---------------------------------------------------------

export const useCreateRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
    }: {
      taskId: string;
    }) =>
      api.post("/recommendations/", {
        task_id: taskId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recommendations"],
      });
    },
  });
};

// ---------------------------------------------------------
// Accept Recommendation
// ---------------------------------------------------------

export const useAcceptRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recommendationId,
    }: {
      recommendationId: string;
    }) =>
      api.put(
        `/recommendations/${recommendationId}/accept`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recommendations"],
      });
    },
  });
};

// ---------------------------------------------------------
// Dismiss Recommendation
// ---------------------------------------------------------

export const useDismissRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recommendationId,
    }: {
      recommendationId: string;
    }) =>
      api.put(
        `/recommendations/${recommendationId}/dismiss`
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recommendations"],
      });
    },
  });
};

// ---------------------------------------------------------
// Analytics - Performance
// ---------------------------------------------------------

export const useResourceUtilisation = () =>
  useQuery({
    queryKey: ["performance", "resources"],
    queryFn: () =>
      fetcher("/analytics/performance"),
  });

export const useIndividualPerformance = () =>
  useQuery({
    queryKey: ["performance", "individual"],
    queryFn: () =>
      fetcher("/analytics/performance"),
  });

// ---------------------------------------------------------
// Analytics - Risk Predictions
// ---------------------------------------------------------

export const useRiskPredictions = () =>
  useQuery({
    queryKey: ["risk-predictions"],
    queryFn: () =>
      fetcher("/analytics/risk-predictions"),
  });

// ---------------------------------------------------------
// Analytics - Productivity
//
// There is no /analytics/sla endpoint in the backend.
// Use productivity endpoint instead.
// ---------------------------------------------------------

export const useSLACompliance = () =>
  useQuery({
    queryKey: ["sla-compliance"],
    queryFn: () =>
      fetcher("/analytics/productivity"),
  });