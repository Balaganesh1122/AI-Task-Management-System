export type Priority = "High" | "Medium" | "Low";
export type Status = "Completed" | "In Progress" | "Pending" | "Overdue";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string;
  assigneeAvatar: string;
  department: string;
  createdDate: string;
  dueDate: string;
  progress: number;
  estimatedHours: number;
  actualHours?: number;
  delayDays?: number;
  complexity?: "Easy" | "Medium" | "Hard";
  bugsReported?: number;
  reworkHours?: number;
  sprint?: number;
  tags: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  skills: string[];
  workload: number; // percentage
  availability: "Available" | "Busy" | "On Leave";
  tasksAssigned: number;
}

const AVATARS: Record<string, string> = {
  Rahul: "https://i.pravatar.cc/40?img=2",
  Priya: "https://i.pravatar.cc/40?img=5",
  Kiran: "https://i.pravatar.cc/40?img=3",
  Sneha: "https://i.pravatar.cc/40?img=7",
  Arjun: "https://i.pravatar.cc/40?img=6",
};

export const liveDatasetRaw = [
  { id: "1001", title: "Login API", assignee: "Rahul", priority: "High", complexity: "Medium", est: 24, act: 28, delay: 2, status: "Completed", team: "Backend", exp: 4, bugs: 3, rework: 2, sprint: 1 },
  { id: "1002", title: "Signup API", assignee: "Priya", priority: "Medium", complexity: "Easy", est: 16, act: 15, delay: 0, status: "Completed", team: "Backend", exp: 3, bugs: 1, rework: 0, sprint: 1 },
  { id: "1003", title: "Dashboard UI", assignee: "Kiran", priority: "High", complexity: "Hard", est: 40, act: 48, delay: 4, status: "Completed", team: "Frontend", exp: 5, bugs: 6, rework: 5, sprint: 1 },
  { id: "1004", title: "Payment Module", assignee: "Sneha", priority: "High", complexity: "Hard", est: 60, act: 72, delay: 6, status: "Completed", team: "Backend", exp: 6, bugs: 8, rework: 7, sprint: 2 },
  { id: "1005", title: "User Profile", assignee: "Arjun", priority: "Low", complexity: "Easy", est: 12, act: 11, delay: 0, status: "Completed", team: "Frontend", exp: 2, bugs: 0, rework: 0, sprint: 2 },
  { id: "1006", title: "Notification Service", assignee: "Rahul", priority: "Medium", complexity: "Medium", est: 20, act: 22, delay: 1, status: "Completed", team: "Backend", exp: 4, bugs: 2, rework: 1, sprint: 2 },
  { id: "1007", title: "Email Service", assignee: "Priya", priority: "Medium", complexity: "Medium", est: 18, act: 19, delay: 1, status: "Completed", team: "Backend", exp: 3, bugs: 1, rework: 1, sprint: 2 },
  { id: "1008", title: "Report Module", assignee: "Kiran", priority: "High", complexity: "Hard", est: 36, act: 44, delay: 3, status: "Completed", team: "Analytics", exp: 5, bugs: 4, rework: 3, sprint: 2 },
  { id: "1009", title: "Search Feature", assignee: "Sneha", priority: "High", complexity: "Medium", est: 28, act: 31, delay: 2, status: "Completed", team: "Backend", exp: 6, bugs: 2, rework: 2, sprint: 3 },
  { id: "1010", title: "Role Management", assignee: "Arjun", priority: "Medium", complexity: "Medium", est: 24, act: 25, delay: 1, status: "Completed", team: "Backend", exp: 2, bugs: 1, rework: 1, sprint: 3 },
  { id: "1011", title: "Task Assignment", assignee: "Rahul", priority: "High", complexity: "Medium", est: 20, act: 24, delay: 2, status: "Completed", team: "Backend", exp: 4, bugs: 2, rework: 2, sprint: 3 },
  { id: "1012", title: "Task Comments", assignee: "Priya", priority: "Low", complexity: "Easy", est: 10, act: 10, delay: 0, status: "Completed", team: "Frontend", exp: 3, bugs: 0, rework: 0, sprint: 3 },
  { id: "1013", title: "Calendar View", assignee: "Kiran", priority: "Medium", complexity: "Medium", est: 22, act: 24, delay: 1, status: "Completed", team: "Frontend", exp: 5, bugs: 1, rework: 1, sprint: 3 },
  { id: "1014", title: "Reminder System", assignee: "Sneha", priority: "Medium", complexity: "Medium", est: 18, act: 20, delay: 1, status: "Completed", team: "Backend", exp: 6, bugs: 2, rework: 1, sprint: 4 },
  { id: "1015", title: "Analytics Dashboard", assignee: "Arjun", priority: "High", complexity: "Hard", est: 50, act: 58, delay: 3, status: "Overdue", team: "Analytics", exp: 2, bugs: 5, rework: 4, sprint: 4 },
  { id: "1016", title: "Dark Mode", assignee: "Rahul", priority: "Low", complexity: "Easy", est: 8, act: 9, delay: 0, status: "Completed", team: "Frontend", exp: 4, bugs: 0, rework: 0, sprint: 4 },
  { id: "1017", title: "Chat Module", assignee: "Priya", priority: "High", complexity: "Hard", est: 45, act: 55, delay: 5, status: "Overdue", team: "Backend", exp: 3, bugs: 7, rework: 6, sprint: 4 },
  { id: "1018", title: "Project Archive", assignee: "Kiran", priority: "Medium", complexity: "Medium", est: 20, act: 21, delay: 1, status: "Completed", team: "Backend", exp: 5, bugs: 1, rework: 1, sprint: 4 },
  { id: "1019", title: "Sprint Board", assignee: "Sneha", priority: "High", complexity: "Medium", est: 26, act: 30, delay: 2, status: "In Progress", team: "Frontend", exp: 6, bugs: 3, rework: 2, sprint: 5 },
  { id: "1020", title: "File Upload", assignee: "Arjun", priority: "Medium", complexity: "Medium", est: 18, act: 19, delay: 1, status: "Completed", team: "Backend", exp: 2, bugs: 1, rework: 1, sprint: 5 },
  { id: "1021", title: "Bug Tracker", assignee: "Rahul", priority: "High", complexity: "Hard", est: 42, act: 50, delay: 4, status: "Overdue", team: "QA", exp: 4, bugs: 5, rework: 4, sprint: 5 },
  { id: "1022", title: "Performance Optimization", assignee: "Priya", priority: "High", complexity: "Hard", est: 48, act: 54, delay: 3, status: "Completed", team: "Backend", exp: 3, bugs: 6, rework: 4, sprint: 5 },
  { id: "1023", title: "Notification UI", assignee: "Kiran", priority: "Low", complexity: "Easy", est: 10, act: 11, delay: 0, status: "Completed", team: "Frontend", exp: 5, bugs: 0, rework: 0, sprint: 5 },
  { id: "1024", title: "API Gateway", assignee: "Sneha", priority: "High", complexity: "Hard", est: 55, act: 65, delay: 5, status: "Overdue", team: "Backend", exp: 6, bugs: 8, rework: 6, sprint: 6 },
  { id: "1025", title: "Session Management", assignee: "Arjun", priority: "Medium", complexity: "Medium", est: 24, act: 26, delay: 1, status: "Completed", team: "Backend", exp: 2, bugs: 2, rework: 1, sprint: 6 },
  { id: "1026", title: "Audit Logs", assignee: "Rahul", priority: "Medium", complexity: "Medium", est: 20, act: 22, delay: 1, status: "Completed", team: "Backend", exp: 4, bugs: 1, rework: 1, sprint: 6 },
  { id: "1027", title: "Access Control", assignee: "Priya", priority: "High", complexity: "Hard", est: 40, act: 46, delay: 3, status: "Completed", team: "Backend", exp: 3, bugs: 5, rework: 3, sprint: 6 },
  { id: "1028", title: "Project Reports", assignee: "Kiran", priority: "Medium", complexity: "Medium", est: 30, act: 32, delay: 2, status: "Completed", team: "Analytics", exp: 5, bugs: 2, rework: 2, sprint: 6 },
  { id: "1029", title: "Task Export", assignee: "Sneha", priority: "Low", complexity: "Easy", est: 12, act: 12, delay: 0, status: "Completed", team: "Frontend", exp: 6, bugs: 0, rework: 0, sprint: 7 },
  { id: "1030", title: "CSV Import", assignee: "Arjun", priority: "Low", complexity: "Easy", est: 14, act: 13, delay: 0, status: "Completed", team: "Backend", exp: 2, bugs: 0, rework: 0, sprint: 7 },
  { id: "1031", title: "Kanban Board", assignee: "Rahul", priority: "High", complexity: "Hard", est: 38, act: 45, delay: 3, status: "In Progress", team: "Frontend", exp: 4, bugs: 4, rework: 3, sprint: 7 },
  { id: "1032", title: "Team Chat", assignee: "Priya", priority: "Medium", complexity: "Medium", est: 24, act: 25, delay: 1, status: "Completed", team: "Backend", exp: 3, bugs: 1, rework: 1, sprint: 7 },
  { id: "1033", title: "Calendar Sync", assignee: "Kiran", priority: "Medium", complexity: "Medium", est: 22, act: 24, delay: 1, status: "Completed", team: "Backend", exp: 5, bugs: 2, rework: 1, sprint: 7 },
  { id: "1034", title: "Time Tracker", assignee: "Sneha", priority: "High", complexity: "Medium", est: 26, act: 30, delay: 2, status: "Completed", team: "Backend", exp: 6, bugs: 2, rework: 2, sprint: 7 },
  { id: "1035", title: "Resource Planner", assignee: "Arjun", priority: "High", complexity: "Hard", est: 46, act: 53, delay: 4, status: "Pending", team: "Analytics", exp: 2, bugs: 6, rework: 5, sprint: 8 },
  { id: "1036", title: "Task Labels", assignee: "Rahul", priority: "Low", complexity: "Easy", est: 10, act: 10, delay: 0, status: "Completed", team: "Frontend", exp: 4, bugs: 0, rework: 0, sprint: 8 },
  { id: "1037", title: "Recurring Tasks", assignee: "Priya", priority: "Medium", complexity: "Medium", est: 20, act: 22, delay: 1, status: "Completed", team: "Backend", exp: 3, bugs: 1, rework: 1, sprint: 8 },
  { id: "1038", title: "Workload View", assignee: "Kiran", priority: "High", complexity: "Hard", est: 44, act: 52, delay: 4, status: "Overdue", team: "Analytics", exp: 5, bugs: 5, rework: 4, sprint: 8 },
  { id: "1039", title: "Project Timeline", assignee: "Sneha", priority: "High", complexity: "Hard", est: 48, act: 58, delay: 5, status: "In Progress", team: "Frontend", exp: 6, bugs: 6, rework: 5, sprint: 8 },
  { id: "1040", title: "Task Templates", assignee: "Arjun", priority: "Low", complexity: "Easy", est: 12, act: 12, delay: 0, status: "Completed", team: "Backend", exp: 2, bugs: 0, rework: 0, sprint: 8 },
  { id: "1041", title: "AI Suggestions", assignee: "Rahul", priority: "High", complexity: "Hard", est: 60, act: 68, delay: 4, status: "In Progress", team: "AI", exp: 4, bugs: 7, rework: 6, sprint: 9 },
  { id: "1042", title: "Risk Prediction", assignee: "Priya", priority: "High", complexity: "Hard", est: 55, act: 64, delay: 5, status: "Overdue", team: "AI", exp: 3, bugs: 8, rework: 6, sprint: 9 },
  { id: "1043", title: "Delay Prediction", assignee: "Kiran", priority: "High", complexity: "Hard", est: 52, act: 60, delay: 4, status: "In Progress", team: "AI", exp: 5, bugs: 6, rework: 5, sprint: 9 },
  { id: "1044", title: "Task Prioritization", assignee: "Sneha", priority: "Medium", complexity: "Medium", est: 28, act: 30, delay: 1, status: "Completed", team: "AI", exp: 6, bugs: 2, rework: 1, sprint: 9 },
  { id: "1045", title: "Resource Allocation", assignee: "Arjun", priority: "High", complexity: "Hard", est: 50, act: 59, delay: 4, status: "Pending", team: "AI", exp: 2, bugs: 5, rework: 4, sprint: 9 },
  { id: "1046", title: "AI Chatbot", assignee: "Rahul", priority: "High", complexity: "Hard", est: 58, act: 66, delay: 4, status: "Pending", team: "AI", exp: 4, bugs: 7, rework: 5, sprint: 10 },
  { id: "1047", title: "Project Summary", assignee: "Priya", priority: "Medium", complexity: "Medium", est: 22, act: 23, delay: 1, status: "Completed", team: "AI", exp: 3, bugs: 1, rework: 1, sprint: 10 },
  { id: "1048", title: "Weekly Report", assignee: "Kiran", priority: "Low", complexity: "Easy", est: 14, act: 14, delay: 0, status: "Completed", team: "Analytics", exp: 5, bugs: 0, rework: 0, sprint: 10 },
  { id: "1049", title: "Productivity Score", assignee: "Sneha", priority: "Medium", complexity: "Medium", est: 24, act: 26, delay: 1, status: "Completed", team: "AI", exp: 6, bugs: 2, rework: 1, sprint: 10 },
  { id: "1050", title: "Final Deployment", assignee: "Arjun", priority: "High", complexity: "Hard", est: 64, act: 75, delay: 6, status: "Overdue", team: "DevOps", exp: 2, bugs: 9, rework: 7, sprint: 10 },
];

export const tasks: Task[] = liveDatasetRaw.map((item) => ({
  id: item.id,
  title: item.title,
  description: `${item.title} (${item.complexity} Complexity) - Executed by ${item.assignee} in Sprint ${item.sprint}. Reported ${item.bugs} bugs and ${item.rework}h rework time.`,
  priority: item.priority as Priority,
  status: item.status as Status,
  assignee: item.assignee,
  assigneeAvatar: AVATARS[item.assignee] || "https://i.pravatar.cc/40?img=1",
  department: item.team,
  createdDate: `2025-0${Math.min(9, item.sprint)}-01`,
  dueDate: `2025-0${Math.min(9, item.sprint)}-15`,
  progress: item.status === "Completed" ? 100 : item.status === "In Progress" ? 60 : item.status === "Overdue" ? 40 : 0,
  estimatedHours: item.est,
  actualHours: item.act,
  delayDays: item.delay,
  complexity: item.complexity as "Easy" | "Medium" | "Hard",
  bugsReported: item.bugs,
  reworkHours: item.rework,
  sprint: item.sprint,
  tags: [item.team, item.complexity, `Sprint-${item.sprint}`],
}));

// Update an existing task in the in-memory list (used by local demo mode)
export function updateTask(updated: Task) {
  const idx = tasks.findIndex((t) => t.id === updated.id);
  if (idx !== -1) {
    tasks[idx] = updated;
  } else {
    tasks.push(updated);
  }
}

export const teamMembers: TeamMember[] = [
  {
    id: "U-001",
    name: "Padma Priya",
    role: "Frontend Developer",
    department: "Engineering",
    avatar: "https://i.pravatar.cc/40?img=1",
    skills: ["React", "TypeScript", "Tailwind CSS", "UI/UX"],
    workload: 65,
    availability: "Available",
    tasksAssigned: 3,
  },
  {
    id: "U-002",
    name: "Rahul Sharma",
    role: "Full Stack Developer",
    department: "Engineering",
    avatar: "https://i.pravatar.cc/40?img=2",
    skills: ["Node.js", "React", "PostgreSQL", "AWS"],
    workload: 80,
    availability: "Busy",
    tasksAssigned: 5,
  },
  {
    id: "U-003",
    name: "Ganesh Kumar",
    role: "Backend Developer",
    department: "Engineering",
    avatar: "https://i.pravatar.cc/40?img=3",
    skills: ["Java", "Spring Boot", "Microservices", "Docker"],
    workload: 90,
    availability: "Busy",
    tasksAssigned: 6,
  },
  {
    id: "U-004",
    name: "Darshan Patel",
    role: "UI/UX Designer",
    department: "Design",
    avatar: "https://i.pravatar.cc/40?img=4",
    skills: ["Figma", "CSS", "Responsive Design", "Prototyping"],
    workload: 45,
    availability: "Available",
    tasksAssigned: 2,
  },
  {
    id: "U-005",
    name: "Priya Nair",
    role: "ML Engineer",
    department: "AI/ML",
    avatar: "https://i.pravatar.cc/40?img=5",
    skills: ["Python", "TensorFlow", "NLP", "Data Science"],
    workload: 30,
    availability: "Available",
    tasksAssigned: 1,
  },
  {
    id: "U-006",
    name: "Arjun Mehta",
    role: "Data Engineer",
    department: "Engineering",
    avatar: "https://i.pravatar.cc/40?img=6",
    skills: ["Python", "Spark", "Kafka", "Analytics"],
    workload: 55,
    availability: "Available",
    tasksAssigned: 2,
  },
];

  // Update an existing team member in the in-memory list
  export function updateTeamMember(updated: TeamMember) {
    const idx = teamMembers.findIndex((t) => t.id === updated.id);
    if (idx !== -1) {
      teamMembers[idx] = updated;
    }
  }

  // Adjust tasksAssigned count for a member by id (delta can be negative)
  export function changeMemberTasksAssigned(memberId: string, delta: number) {
    const m = teamMembers.find((t) => t.id === memberId);
    if (!m) return;
    m.tasksAssigned = Math.max(0, (m.tasksAssigned || 0) + delta);
  }

export interface TimelineEntry {
  id: string;
  taskId: string;
  type: "Status" | "Remark" | "AI Update" | "Blocker";
  content: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  isAi?: boolean;
}

export interface EscalationRecord {
  id: string;
  taskId: string;
  timestamp: string;
  managerNotified: string;
  notes: string;
}

export interface IndividualPerformance {
  id: string;
  name: string;
  avatar: string;
  department: string;
  tasksCompleted: number;
  overdueRate: number; // percentage
  slaCompliance: number; // percentage
  avgCompletionTimeDays: number;
}

export interface RiskPrediction {
  id: string;
  taskTitle: string;
  riskFactor: string;
  severity: "High" | "Medium" | "Low";
  impact: string;
  suggestedAction: string;
}

export interface SLAData {
  category: string;
  met: number;
  breached: number;
}

export const sampleTimelineEntries: Record<string, TimelineEntry[]> = {
  "T-001": [
    {
      id: "TL-101",
      taskId: "T-001",
      type: "AI Update",
      content: "AI detected a potential delay due to backend dependency on REST API integration. Recommended re-allocating 1 QA member.",
      authorName: "Antigravity AI",
      authorAvatar: "https://i.pravatar.cc/40?img=12",
      timestamp: "2025-07-14 09:30 AM",
      isAi: true,
    },
    {
      id: "TL-102",
      taskId: "T-001",
      type: "Blocker",
      content: "Waiting on final designs for dark mode chart components from Figma team.",
      authorName: "Padma Priya",
      authorAvatar: "https://i.pravatar.cc/40?img=1",
      timestamp: "2025-07-12 03:15 PM",
    },
    {
      id: "TL-103",
      taskId: "T-001",
      type: "Status",
      content: "Changed status from Pending to In Progress.",
      authorName: "Padma Priya",
      authorAvatar: "https://i.pravatar.cc/40?img=1",
      timestamp: "2025-07-01 10:00 AM",
    },
    {
      id: "TL-104",
      taskId: "T-001",
      type: "Remark",
      content: "Initial setup of React + Vite workspace completed successfully. Recharts integrated.",
      authorName: "Padma Priya",
      authorAvatar: "https://i.pravatar.cc/40?img=1",
      timestamp: "2025-06-28 11:20 AM",
    },
  ],
};

export const sampleEscalations: Record<string, EscalationRecord[]> = {
  "T-003": [
    {
      id: "ESC-01",
      taskId: "T-003",
      timestamp: "2025-07-05 04:30 PM",
      managerNotified: "Vikram Executive (VP Eng)",
      notes: "Task overdue by 4 days. High security priority requirement.",
    },
  ],
  "T-007": [
    {
      id: "ESC-02",
      taskId: "T-007",
      timestamp: "2025-07-02 11:00 AM",
      managerNotified: "Ananya Roy (Head of Infra)",
      notes: "Database schema migration delayed due to AWS staging outage.",
    },
  ],
};

export const individualPerformanceData: IndividualPerformance[] = [
  { id: "U-101", name: "Rahul", avatar: "https://i.pravatar.cc/40?img=2", department: "Backend", tasksCompleted: 8, overdueRate: 10, slaCompliance: 90, avgCompletionTimeDays: 3.2 },
  { id: "U-102", name: "Priya", avatar: "https://i.pravatar.cc/40?img=5", department: "Backend", tasksCompleted: 8, overdueRate: 20, slaCompliance: 80, avgCompletionTimeDays: 3.5 },
  { id: "U-103", name: "Kiran", avatar: "https://i.pravatar.cc/40?img=3", department: "Frontend", tasksCompleted: 8, overdueRate: 10, slaCompliance: 90, avgCompletionTimeDays: 3.1 },
  { id: "U-104", name: "Sneha", avatar: "https://i.pravatar.cc/40?img=7", department: "Backend", tasksCompleted: 8, overdueRate: 10, slaCompliance: 90, avgCompletionTimeDays: 3.8 },
  { id: "U-105", name: "Arjun", avatar: "https://i.pravatar.cc/40?img=6", department: "Analytics", tasksCompleted: 6, overdueRate: 20, slaCompliance: 80, avgCompletionTimeDays: 3.9 },
];

export const resourceUtilisationData = [
  { department: "Backend", capacity: 100, actual: 92 },
  { department: "Frontend", capacity: 100, actual: 78 },
  { department: "AI", capacity: 100, actual: 88 },
  { department: "Analytics", capacity: 100, actual: 70 },
  { department: "QA", capacity: 100, actual: 65 },
  { department: "DevOps", capacity: 100, actual: 80 },
];

export const riskPredictions7Days: RiskPrediction[] = [
  { id: "RP-1050", taskTitle: "Final Deployment (ID: 1050)", riskFactor: "6 Days Delay & 9 Reported Bugs", severity: "High", impact: "Blocks Sprint 10 delivery", suggestedAction: "Assign Rahul and Sneha to assist Arjun on deployment pipeline" },
  { id: "RP-1042", taskTitle: "Risk Prediction AI (ID: 1042)", riskFactor: "5 Days Overdue & High Complexity", severity: "High", impact: "Delays AI intelligence sync", suggestedAction: "Schedule technical pair programming session with Priya" },
  { id: "RP-1024", taskTitle: "API Gateway (ID: 1024)", riskFactor: "65 Actual Hours vs 55 Estimated", severity: "High", impact: "High backend rework load", suggestedAction: "Benchmark gateway routes in staging environment" },
];

export const slaComplianceDonut = [
  { name: "SLA Met", value: 38, color: "#22C55E" },
  { name: "SLA Breached", value: 12, color: "#EF4444" },
];

export const productivityData = [
  { month: "Sprint 1-2", completed: 8, created: 8 },
  { month: "Sprint 3-4", completed: 8, created: 10 },
  { month: "Sprint 5-6", completed: 8, created: 10 },
  { month: "Sprint 7-8", completed: 8, created: 10 },
  { month: "Sprint 9-10", completed: 6, created: 12 },
];

export const weeklyData = [
  { day: "Sprint 1", tasks: 3 },
  { day: "Sprint 2", tasks: 5 },
  { day: "Sprint 3", tasks: 5 },
  { day: "Sprint 4", tasks: 5 },
  { day: "Sprint 5", tasks: 5 },
  { day: "Sprint 6", tasks: 5 },
  { day: "Sprint 7", tasks: 6 },
  { day: "Sprint 8", tasks: 6 },
  { day: "Sprint 9", tasks: 5 },
  { day: "Sprint 10", tasks: 5 },
];

export const statusDistribution = [
  { name: "Completed", value: 38, color: "#22C55E" },
  { name: "In Progress", value: 4, color: "#2563EB" },
  { name: "Pending", value: 3, color: "#F59E0B" },
  { name: "Overdue", value: 5, color: "#EF4444" },
];

export const teamPerformance = [
  { name: "Backend", completed: 18, pending: 1, overdue: 2 },
  { name: "Frontend", completed: 9, pending: 0, overdue: 0 },
  { name: "AI", completed: 3, pending: 2, overdue: 1 },
  { name: "Analytics", completed: 4, pending: 1, overdue: 1 },
  { name: "QA", completed: 0, pending: 0, overdue: 1 },
  { name: "DevOps", completed: 0, pending: 0, overdue: 1 },
];


