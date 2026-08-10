import * as XLSX from "xlsx";
import type { Priority, Status } from "../types";

const VALID_PRIORITIES = ["High", "Medium", "Low"] as const;
const VALID_STATUSES = ["Pending", "In Progress", "Completed", "Overdue"] as const;

type PriorityValue = (typeof VALID_PRIORITIES)[number];
type StatusValue = (typeof VALID_STATUSES)[number];

export interface ImportedTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string;
  dueDate: string;
  estimatedHours: number;
  department: string;
  tags: string[];
}

const normalizeString = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const normalizePriority = (value: unknown): Priority => {
  const normalized = normalizeString(value).toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "low") return "Low";
  return "Medium";
};

const normalizeStatus = (value: unknown): Status => {
  const normalized = normalizeString(value).toLowerCase();
  if (normalized === "in progress" || normalized === "inprogress") return "In Progress";
  if (normalized === "completed") return "Completed";
  if (normalized === "overdue") return "Overdue";
  return "Pending";
};

const normalizeDate = (value: unknown) => {
  if (!value && value !== 0) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split("T")[0];
  }
  const strValue = normalizeString(value);
  const parsed = new Date(strValue);
  if (!strValue || Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

const normalizeNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return 0;
  const numberValue = Number(String(value).replace(/[^0-9.-]+/g, ""));
  return Number.isNaN(numberValue) ? 0 : numberValue;
};

const normalizeTags = (value: unknown) => {
  const tags = normalizeString(value);
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const parseRows = (rows: Record<string, unknown>[]) => {
  return rows
    .map((row, index) => {
      const title = normalizeString(row["Title"] || row["Task Title"] || row["title"] || "");
      if (!title) return null;

      return {
        id: `upload-${Date.now()}-${index}`,
        title,
        description: normalizeString(row["Description"] || row["description"] || ""),
        priority: normalizePriority(row["Priority"] || row["priority"] || "Medium"),
        status: normalizeStatus(row["Status"] || row["status"] || "Pending"),
        assignee: normalizeString(row["Assignee"] || row["assignee"] || "Unassigned"),
        dueDate: normalizeDate(row["Due Date"] || row["dueDate"] || row["Due date"] || ""),
        estimatedHours: normalizeNumber(row["Estimated Hours"] || row["estimatedHours"] || row["Est Hours"] || row["Hours"] || 0),
        department: normalizeString(row["Department"] || row["department"] || "General"),
        tags: normalizeTags(row["Tags"] || row["tags"] || ""),
      } as ImportedTask;
    })
    .filter((task): task is ImportedTask => task !== null);
};

export const parseTaskSpreadsheet = async (file: File): Promise<ImportedTask[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) {
        reject(new Error("Unable to read file contents."));
        return;
      }

      try {
        const workbook = XLSX.read(result, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve([]);
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: "",
          raw: false,
        });

        const tasks = parseRows(rawRows);
        resolve(tasks);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Unable to read spreadsheet file."));
    reader.readAsArrayBuffer(file);
  });
};
