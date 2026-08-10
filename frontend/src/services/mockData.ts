import {
  tasks,
  teamMembers,
  sampleTimelineEntries,
  individualPerformanceData,
  resourceUtilisationData,
  riskPredictions7Days,
  slaComplianceDonut,
  productivityData,
  statusDistribution,
  teamPerformance,
} from "../data/dummyData";

// ---------------------------------------------------------------------------
// Derived dashboard summary
// ---------------------------------------------------------------------------
const totalTasks = tasks.length;
const completed = tasks.filter((t) => t.status === "Completed").length;
const inProgress = tasks.filter((t) => t.status === "In Progress").length;
const overdue = tasks.filter((t) => t.status === "Overdue").length;
const pending = tasks.filter((t) => t.status === "Pending").length;

const dashboardSummary = {
  totalTasks,
  completedTasks: completed,
  inProgressTasks: inProgress,
  overdueTasks: overdue,
  pendingTasks: pending,
  completionRate: Math.round((completed / totalTasks) * 100),
  teamMembers: teamMembers.length,
  statusDistribution,
  teamPerformance,
  weeklyTrend: productivityData,
};

const productivityStats = {
  data: productivityData,
  avgCompletionTime: 3.5,
  totalHoursLogged: tasks.reduce((s, t) => s + (t.actualHours || 0), 0),
};

// ---------------------------------------------------------------------------
// Email logs mock (50 entries derived from tasks)
// ---------------------------------------------------------------------------
const emailStatuses = ["Delivered", "Failed", "Pending", "Processing"] as const;
const emailTypes = ["Task Assignment", "Reminder", "Due Today", "Deadline Missed", "Task Completed"];

const emailLogs = tasks.slice(0, 50).map((t, i) => {
  const status = emailStatuses[i % 4];
  return {
    id: `EML-${1000 + i}`,
    taskName: t.title,
    assigneeName: t.assignee,
    assigneeAvatar: t.assigneeAvatar,
    emailAddress: `${t.assignee.toLowerCase().replace(" ", ".")}@company.com`,
    assignedBy: "System Admin",
    subject: `Task Assigned: ${t.title}`,
    status,
    emailType: emailTypes[i % emailTypes.length],
    sentTime: `2025-0${Math.min(9, (i % 9) + 1)}-${String((i % 28) + 1).padStart(2, "0")} 10:${String(i % 60).padStart(2, "0")} AM`,
    deliveryTime: status === "Delivered" ? `${(0.5 + (i % 5) * 0.3).toFixed(1)} sec` : undefined,
    content: `Dear ${t.assignee},\n\nYou have been assigned the task "${t.title}".\nPriority: ${t.priority}\nDue Date: ${t.dueDate}\nDepartment: ${t.department}\n\nPlease log in to the system to view full details.\n\nRegards,\nTask Management System`,
  };
});

// ---------------------------------------------------------------------------
// Reports mock
// ---------------------------------------------------------------------------
const reports = {
  summary: dashboardSummary,
  individual: individualPerformanceData,
  resources: resourceUtilisationData,
  sla: slaComplianceDonut,
};

// ---------------------------------------------------------------------------
// AI Recommendations mock
// ---------------------------------------------------------------------------
const recommendations = riskPredictions7Days.map((r) => ({
  id: r.id,
  title: r.taskTitle,
  risk: r.riskFactor,
  severity: r.severity,
  action: r.suggestedAction,
}));

// ---------------------------------------------------------------------------
// Route matcher → mock response
// ---------------------------------------------------------------------------
type MockHandler = (url: string) => unknown;

const routes: [RegExp, MockHandler][] = [
  [/\/dashboard\/summary/, () => dashboardSummary],
  [/\/dashboard\/productivity/, () => productivityStats],
  [/\/users/, () => teamMembers],
  [/\/tasks\/([^/]+)\/full-timeline/, (url) => {
    const id = url.split("/tasks/")[1]?.split("/")[0];
    return sampleTimelineEntries[id] ?? [];
  }],
  [/\/tasks\/([^/]+)\/status/, () => ({ success: true })],
  [/\/tasks\/([^/]+)\/assign/, () => ({ success: true })],
  [/\/tasks\/([^/]+)\/escalate/, () => ({ success: true })],
  [/\/tasks\/([^/]+)$/, (url) => {
    const id = url.split("/tasks/")[1];
    return tasks.find((t) => t.id === id) ?? null;
  }],
  [/\/tasks\/create-from-text/, () => tasks[0]],
  [/\/tasks\/overdue/, () => tasks.filter((t) => t.status === "Overdue")],
  [/\/tasks/, () => tasks],
  [/\/email-logs/, () => emailLogs],
  [/\/reports/, () => reports],
  [/\/recommendations/, () => recommendations],
  [/\/performance\/resources/, () => resourceUtilisationData],
  [/\/performance\/individual/, () => individualPerformanceData],
  [/\/risk-predictions/, () => riskPredictions7Days],
  [/\/sla-compliance/, () => slaComplianceDonut],
];

export function getMockResponse(url: string): unknown | null {
  for (const [pattern, handler] of routes) {
    if (pattern.test(url)) {
      return handler(url);
    }
  }
  return null;
}
