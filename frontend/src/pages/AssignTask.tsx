import { useMemo, useState } from "react";
import { Search, Sparkles, UserCheck, Zap } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ProgressBar from "../components/common/ProgressBar";
import { LoadingSpinner, ErrorMessage } from "../components/common/UIStates";
import { useTasks, useUsers, useAssignTask } from "../hooks/useApi";
import type { Task } from "../types";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  skills: string[];
  workload: number;
  availability: "Available" | "Busy" | "On Leave";
  tasksAssigned: number;
}

const departments = ["All", "Engineering", "Design", "AI/ML", "Backend", "DevOps", "QA"];

const availabilityStyle: Record<string, string> = {
  Available: "bg-green-50 text-green-700 border border-green-200",
  Busy: "bg-amber-50 text-amber-700 border border-amber-200",
  "On Leave": "bg-red-50 text-red-700 border border-red-200",
};

export default function TaskAssignment() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useTasks();
  const assignTaskMutation = useAssignTask();

  const filtered = useMemo(() => {
    return (users || []).filter((m: TeamMember) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
      const matchDept = dept === "All" || m.department === dept;
      return matchSearch && matchDept;
    });
  }, [dept, search, users]);

  const suggested = useMemo(() => (users || []).find((m: TeamMember) => m.availability === "Available" && m.workload < 60), [users]);

  async function assignToSelected() {
    if (!selected || !selectedTask) return;
    const member = users.find((m: TeamMember) => m.id === selected);
    const task = tasks.find((t: Task) => t.id === selectedTask);
    if (!member || !task) return;

    setFeedback("");

    try {
      await assignTaskMutation.mutateAsync({
        taskId: task.id,
        assigneeId: member.id,
        reason: "Manual assignment",
      });

      setFeedback(`Assigned "${task.title}" to ${member.name}`);
      await Promise.all([refetchUsers(), refetchTasks()]);

      setTimeout(() => setFeedback(""), 3000);
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to assign task.";

      setFeedback(`Failed to assign task: ${detail}`);
    }
  }

  const isLoading = usersLoading || tasksLoading;
  const isError = usersError || tasksError;

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 relative">
          
          <div className="mb-7">
            <h1 className="text-[32px] font-bold text-[#111827]">Task Assignment</h1>
            <p className="text-[16px] text-[#9CA3AF] mt-1">Assign tasks to team members based on skills and availability.</p>
          </div>

          <div className="grid grid-cols-3 gap-6 relative min-h-[400px]">
             {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB] z-10">
                  <LoadingSpinner message="Loading team members..." />
                </div>
              ) : isError ? (
                <div className="col-span-3">
                  <ErrorMessage message={(usersError || tasksError)?.message || "Failed to load data"} retry={() => { refetchUsers(); refetchTasks(); }} />
                </div>
              ) : (
                <>
                  {/* Team Members */}
                  <div className="col-span-2 space-y-5">
                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)] flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 min-w-48">
                        <Search size={15} className="text-[#9CA3AF]" />
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search team members..."
                          className="bg-transparent outline-none text-[15px] text-[#111827] placeholder:text-[#9CA3AF] w-full"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {departments.map((d) => (
                          <button
                            key={d}
                            onClick={() => setDept(d)}
                            className={`text-[13px] font-semibold px-3 py-2 rounded-xl transition-colors ${
                              dept === d
                                ? "bg-blue-600 text-white"
                                : "bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-100"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Member Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {filtered.map((member: TeamMember) => (
                      <div
                        key={member.id}
                        onClick={() => setSelected(selected === member.id ? null : member.id)}
                        className={`bg-white rounded-2xl p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)] cursor-pointer transition-all duration-200 ${
                          selected === member.id
                            ? "ring-2 ring-blue-500 shadow-[0_10px_30px_rgba(15,23,42,0.10)]"
                            : "hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)]"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img src={member.avatar || "https://i.pravatar.cc/150"} alt={member.name} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <p className="text-[15px] font-semibold text-[#111827]">{member.name}</p>
                              <p className="text-[13px] text-[#6B7280]">{member.role}</p>
                            </div>
                          </div>
                          <span className={`text-[12px] font-semibold px-2 py-1 rounded-lg ${availabilityStyle[member.availability]}`}>
                            {member.availability}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] text-[#6B7280]">Workload</span>
                            <span className="text-[13px] font-semibold text-[#374151]">{member.workload}%</span>
                          </div>
                          <ProgressBar value={member.workload} height="h-1.5" />
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {(member.skills || []).slice(0, 3).map((skill: string) => (
                            <span key={skill} className="text-[12px] bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-md font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                          <span>{member.tasksAssigned} tasks assigned</span>
                          <span>{member.department}</span>
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className="space-y-5">
                    {/* AI Suggestion */}
                    {suggested && (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles size={16} className="text-purple-600" />
                          <p className="text-sm font-semibold text-purple-700">AI Suggested Assignee</p>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <img src={suggested.avatar || "https://i.pravatar.cc/150"} alt={suggested.name} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">{suggested.name}</p>
                            <p className="text-xs text-[#6B7280]">{suggested.role}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs text-[#6B7280]">
                          <div className="flex items-center gap-1.5">
                            <Zap size={11} className="text-purple-500" />
                            <span>Workload: {suggested.workload}% â€” optimal capacity</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Zap size={11} className="text-purple-500" />
                            <span>Skills match: {(suggested.skills || []).slice(0, 2).join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Zap size={11} className="text-purple-500" />
                            <span>AI Confidence: 94%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selected Member */}
                    <div className="bg-white rounded-2xl p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
                      <h3 className="text-[18px] font-semibold text-[#111827] mb-4">
                        {selected ? "Selected Member" : "Select a Member"}
                      </h3>
                      {selected ? (() => {
                        const m = users.find((x: TeamMember) => x.id === selected);
                        if (!m) return null;
                        return (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <img src={m.avatar || "https://i.pravatar.cc/150"} alt={m.name} className="w-12 h-12 rounded-xl object-cover" />
                              <div>
                                <p className="font-semibold text-[#111827]">{m.name}</p>
                                <p className="text-sm text-[#6B7280]">{m.role}</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm mb-5">
                              <div className="flex justify-between">
                                <span className="text-[#6B7280]">Department</span>
                                <span className="font-medium text-[#374151]">{m.department}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#6B7280]">Tasks Assigned</span>
                                <span className="font-medium text-[#374151]">{m.tasksAssigned}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#6B7280]">Availability</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${availabilityStyle[m.availability]}`}>
                                  {m.availability}
                                </span>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-sm text-[#6B7280] mb-1">Select Task</label>
                              <select value={selectedTask ?? ""} onChange={(e) => setSelectedTask(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none bg-white">
                                <option value="">-- Choose a task --</option>
                                {tasks.map((t: Task) => (
                                  <option key={t.id} value={t.id}>{t.title} ({t.id})</option>
                                ))}
                              </select>
                            </div>
                            {feedback && <p className={`mb-3 rounded-lg border px-3 py-2 text-sm ${feedback.startsWith('Failed') ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{feedback}</p>}
                            <button onClick={assignToSelected} disabled={!selectedTask || assignTaskMutation.isPending} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full justify-center disabled:opacity-60">
                              <UserCheck size={15} />
                              {assignTaskMutation.isPending ? "Assigning..." : "Assign Task"}
                            </button>
                          </div>
                        );
                      })() : (
                        <p className="text-sm text-[#9CA3AF] text-center py-6">
                          Click on a team member card to select them for assignment.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}