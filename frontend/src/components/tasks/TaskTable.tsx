import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ArrowUpDown, Download } from "lucide-react";
import type { Priority, Status, Task } from "../../types";
import { useTasks } from "../../hooks/useApi";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../common/UIStates";
import PriorityBadge from "../common/PriorityBadge";
import StatusPill from "../common/StatusPill";
import ProgressBar from "../common/ProgressBar";

type SortKey = "dueDate" | "priority" | "createdDate";
const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export default function TaskTable() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");

  const { data: tasks = [], isLoading, error, refetch } = useTasks();

  const filtered = tasks
    .filter((t: Task) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.assignee.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a: Task, b: Task) => {
      if (sortKey === "dueDate") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortKey === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    });

  function downloadFiltered() {
    if (!filtered || filtered.length === 0) return;
    const dataStr = JSON.stringify(filtered, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-filtered-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function convertToCSV(arr: any[]) {
    if (!arr || arr.length === 0) return "";
    const headers = ["id", "title", "description", "priority", "status", "assignee", "department", "createdDate", "dueDate", "progress", "estimatedHours", "tags"];
    const escape = (v: any) => {
      if (v == null) return "";
      if (Array.isArray(v)) return `"${v.join(';').replace(/"/g, '""')}"`;
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };
    const rows = arr.map((item) => headers.map((h) => escape(item[h])).join(','));
    return headers.join(',') + '\n' + rows.join('\n');
  }

  function downloadFilteredCSV() {
    if (!filtered || filtered.length === 0) return;
    const csv = convertToCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-filtered-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col min-h-[500px]">
      {/* Filter Bar */}
      <div className="p-5 border-b border-[#E5E7EB] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or assignees..."
            className="bg-transparent outline-none text-sm text-[#111827] placeholder:text-[#9CA3AF] w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#6B7280]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "All")}
            className="text-sm border border-[#E5E7EB] rounded-xl px-3 py-2 bg-white text-[#374151] outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option>Completed</option>
            <option>In Progress</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "All")}
            className="text-sm border border-[#E5E7EB] rounded-xl px-3 py-2 bg-white text-[#374151] outline-none cursor-pointer"
          >
            <option value="All">All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button onClick={downloadFilteredCSV} className="flex items-center gap-2 ml-2 border border-[#E5E7EB] rounded-xl px-3 py-2 bg-white text-sm text-[#374151] hover:bg-gray-50">
            <Download size={14} /> Download CSV
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={15} className="text-[#6B7280]" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-sm border border-[#E5E7EB] rounded-xl px-3 py-2 bg-white text-[#374151] outline-none cursor-pointer"
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="createdDate">Sort: Created</option>
          </select>
        </div>

        <span className="text-xs text-[#9CA3AF] ml-auto">{filtered.length} tasks</span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-x-auto relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <LoadingSpinner message="Fetching tasks..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorMessage message={error.message} retry={refetch} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
             <EmptyState title="No tasks found" message="Try adjusting your search or filters." />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                {["Task", "Assignee", "Priority", "Status", "Progress", "Due Date", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((task: Task) => (
                <tr key={task.id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-[#111827] group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5 max-w-xs truncate">{task.description}</p>
                      <div className="flex gap-1 mt-1.5">
                        {(task.tags || []).slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded-md font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <img src={task.assigneeAvatar || "https://i.pravatar.cc/150"} alt={task.assignee} className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-[#374151]">{task.assignee}</p>
                        <p className="text-xs text-[#9CA3AF]">{task.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={task.status} />
                  </td>
                  <td className="px-5 py-4 w-36">
                    <ProgressBar value={task.progress || 0} showLabel height="h-1.5" />
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-[#374151]">
                      {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">{task.estimatedHours}h est.</p>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
