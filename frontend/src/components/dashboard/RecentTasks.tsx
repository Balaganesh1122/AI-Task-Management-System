import { useNavigate } from "react-router-dom";
import type { Task } from "../../types";

const statusStyle: Record<string, string> = {
  "In Progress": "bg-[#DBEAFE] text-[#1D4ED8]",
  Completed: "bg-[#DCFCE7] text-[#15803D]",
  Overdue: "bg-[#FEE2E2] text-[#DC2626]",
  Pending: "bg-[#FEF9C3] text-[#92400E]",
};

export default function RecentTasks({ tasks = [] }: { tasks?: Task[] }) {
  const navigate = useNavigate();
  const recent = tasks.slice(0, 5);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
        <h2 className="text-[18px] font-semibold text-[#111827]">Recent Tasks</h2>
        <button
          onClick={() => navigate("/tasks")}
          className="text-[14px] font-medium text-[#2563EB] hover:underline"
        >
          View All
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            {["TASK DESCRIPTION", "PROJECT", "STATUS", "DUE DATE", "ASSIGNED"].map((h) => (
              <th key={h} className="text-left text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-5 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recent.map((task, i) => (
            <tr
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className={`cursor-pointer hover:bg-[#F9FAFB] transition-colors ${i < recent.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}
            >
              {/* Task description */}
              <td className="px-5 py-3.5">
                <p className="text-[15px] font-semibold text-[#111827] leading-tight">{task.title}</p>
                <p className="text-[13px] text-[#9CA3AF] mt-0.5 truncate max-w-[220px]">
                  {task.description.slice(0, 40)}…
                </p>
              </td>
              {/* Project */}
              <td className="px-5 py-3.5">
                <span className="text-[14px] text-[#374151]">{task.department}</span>
              </td>
              {/* Status pill */}
              <td className="px-5 py-3.5">
                <span className={`inline-block text-[12px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${statusStyle[task.status]}`}>
                  {task.status === "In Progress" ? "IN PROGRESS" : task.status.toUpperCase()}
                </span>
              </td>
              {/* Due date */}
              <td className="px-5 py-3.5">
                <span className="text-[14px] text-[#374151]">
                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </td>
              {/* Assigned avatar */}
              <td className="px-5 py-3.5">
                <div className="w-7 h-7 rounded-full bg-[#6B7280] flex items-center justify-center text-white text-[11px] font-bold overflow-hidden">
                  <img src={task.assigneeAvatar} alt={task.assignee} className="w-full h-full object-cover" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
