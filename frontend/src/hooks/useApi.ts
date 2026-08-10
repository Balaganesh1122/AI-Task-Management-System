import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";

// Generic fetcher
const fetcher = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};

// Dashboard hooks
export const useDashboardSummary = () => useQuery({
  queryKey: ['dashboard', 'summary'],
  queryFn: () => fetcher('/dashboard/summary')
});

export const useProductivityStats = () => useQuery({
  queryKey: ['dashboard', 'productivity'],
  queryFn: () => fetcher('/dashboard/productivity')
});

// Users hooks
export const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: () => fetcher('/users'),
});

// Tasks hooks
export const useTasks = (filters?: any) => useQuery({
  queryKey: ['tasks', filters],
  queryFn: () => fetcher('/tasks'),
});

export const useTask = (id: string) => useQuery({
  queryKey: ['tasks', id],
  queryFn: () => fetcher(`/tasks/${id}`),
  enabled: !!id
});

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask: any) => api.post('/tasks', newTask),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });
};

export const useCreateTaskFromText = () => {
  return useMutation({
    mutationFn: (text: string) => api.post('/tasks/create-from-text', { text })
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, progress }: { id: string, status: string, progress?: number }) => api.patch(`/tasks/${id}/status`, { status, progress }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, assignee, assigneeId }: { taskId: string, assignee: string, assigneeId: string }) => api.put(`/tasks/${taskId}/assign`, { assignee, assigneeId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });
};

export const useEscalateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, managerNotified, notes }: { taskId: string, managerNotified: string, notes: string }) => api.post(`/tasks/${taskId}/escalate`, { managerNotified, notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });
};

export const useTaskTimeline = (id: string) => useQuery({
  queryKey: ['tasks', id, 'timeline'],
  queryFn: () => fetcher(`/tasks/${id}/full-timeline`),
  enabled: !!id
});

// Overdue tasks
export const useOverdueTasks = () => useQuery({
  queryKey: ['tasks', 'overdue'],
  queryFn: () => fetcher('/tasks/overdue')
});

// Reports
export const useReports = () => useQuery({
  queryKey: ['reports'],
  queryFn: () => fetcher('/reports')
});

// AI Recommendations
export const useAIRecommendations = () => useQuery({
  queryKey: ['recommendations'],
  queryFn: () => fetcher('/recommendations')
});

// Resources/Performance
export const useResourceUtilisation = () => useQuery({
  queryKey: ['performance', 'resources'],
  queryFn: () => fetcher('/performance/resources')
});

export const useIndividualPerformance = () => useQuery({
  queryKey: ['performance', 'individual'],
  queryFn: () => fetcher('/performance/individual')
});

export const useRiskPredictions = () => useQuery({
  queryKey: ['risk-predictions'],
  queryFn: () => fetcher('/risk-predictions')
});

export const useSLACompliance = () => useQuery({
  queryKey: ['sla-compliance'],
  queryFn: () => fetcher('/sla-compliance')
});
