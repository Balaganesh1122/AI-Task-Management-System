export type Status = "Pending" | "In Progress" | "Completed" | "Overdue";
export type Priority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  assignee: string;
  assigneeAvatar?: string;
  department: string;
  createdDate: string;
  progress: number;
  estimatedHours: number;
  tags: string[];
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
