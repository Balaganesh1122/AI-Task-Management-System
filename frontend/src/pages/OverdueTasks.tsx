import { useState, useMemo } from "react";
import { AlertTriangle, Bell, Clock, ShieldAlert, ArrowUpRight, CheckCircle2, History, X, Sparkles, Send } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import PriorityBadge from "../components/common/PriorityBadge";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../components/common/UIStates";
import { useOverdueTasks, useUpdateTaskStatus, useEscalateTask } from "../hooks/useApi";
import type { Task, Status } from "../types";

interface EscalationRecord {
  id: string;
  taskId: string;
  timestamp: string;
  managerNotified: string;
  notes: string;
}

function riskCategorization(daysOverdue: number) {
  if (daysOverdue >= 14) return { level: "High Risk", style: "bg-red-100 text-red-700 border border-red-300", badgeColor: "bg-red-50 text-red-700 border-red-200" };
  if (daysOverdue >= 7)  return { level: "Medium Risk", style: "bg-orange-100 text-orange-700 border border-orange-300", badgeColor: "bg-orange-50 text-orange-700 border-orange-200" };
  return { level: "Low Risk", style: "bg-amber-100 text-amber-700 border border-amber-300", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" };
}

const AI_CORRECTIVE_ACTIONS: Record<string, string> = {
  "T-003": "High risk delay. Reassign 1 backend developer from low-priority tasks to review JWT token expiration logic.",
  "T-007": "Database schema migration issue. Schedule an immediate index benchmarking session and run automated diagnostic check.",
};

const STATUS_OPTIONS: Status[] = ["Pending", "In Progress", "Completed", "Overdue"];
const STATUS_STYLE: Record<Status, string> = {
  Pending:      "bg-amber-50 border-amber-300 text-amber-700",
  "In Progress":"bg-blue-50 border-blue-300 text-blue-700",
  Completed:    "bg-green-50 border-green-300 text-green-700",
  Overdue:      "bg-red-50 border-red-300 text-red-700",
};

export default function OverdueTasks() {
  const { data: overdue = [], isLoading, error, refetch } = useOverdueTasks();
  const updateStatusMutation = useUpdateTaskStatus();
  const escalateTaskMutation = useEscalateTask();

  const [escalationLogs, setEscalationLogs] = useState<Record<string, EscalationRecord[]>>({});

  // Escalation Modal state
  const [selectedTaskForEscalation, setSelectedTaskForEscalation] = useState<Task | null>(null);
  const [managerInput, setManagerInput] = useState("Vikram Executive (VP Eng)");
  const [escalationNotes, setEscalationNotes] = useState("");
  const [activeHistoryTaskId, setActiveHistoryTaskId] = useState<string | null>(null);
  const [remindedTasks, setRemindedTasks] = useState<Record<string, boolean>>({});

  async function changeStatus(id: string, status: Status) {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch {
      // Handle error gracefully
    }
  }

  function handleSendReminder(taskId: string) {
    setRemindedTasks((prev) => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      setRemindedTasks((prev) => ({ ...prev, [taskId]: false }));
    }, 3000);
  }

  async function handleConfirmEscalation() {
    if (!selectedTaskForEscalation) return;
    const taskId = selectedTaskForEscalation.id;
    const managerNotified = managerInput;
    const notes = escalationNotes;

    try {
      await escalateTaskMutation.mutateAsync({
        taskId,
        managerNotified,
        notes,
      });
    } catch {
      // Mock fallback
    } finally {
      const newRecord: EscalationRecord = {
        id: `ESC-${Date.now()}`,
        taskId,
        timestamp: new Date().toLocaleString(),
        managerNotified,
        notes: notes || "Direct escalation triggered by project manager.",
      };

      setEscalationLogs((prev) => ({
        ...prev,
        [taskId]: [newRecord, ...(prev[taskId] || [])],
      }));

      setSelectedTaskForEscalation(null);
      setEscalationNotes("");
    }
  }

  // Calculate Risk Breakdown
  const riskCounts = useMemo(() => {
    return (overdue || []).reduce(
      (acc: any, task: Task) => {
        const daysOverdue = Math.max(1, Math.ceil((Date.now() - new Date(task.dueDate).getTime()) / 86400000));
        const category = riskCategorization(daysOverdue).level;
        if (category === "High Risk") acc.high++;
        else if (category === "Medium Risk") acc.medium++;
        else acc.low++;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );
  }, [overdue]);

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[24px] font-bold text-[#111827]">Overdue Management Panel</h1>
              <p className="text-[14px] text-[#6B7280] mt-1">Real-time overdue tracking, AI corrective guidance, and executive escalations.</p>
            </div>
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              <AlertTriangle size={15} className="text-red-600" />
              <span className="text-[14px] font-semibold text-red-700">{(overdue || []).length} Total Overdue</span>
            </div>
          </div>

          <div className="relative min-h-[400px]">
             {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB] z-10">
                  <LoadingSpinner message="Loading overdue tasks..." />
                </div>
              ) : error ? (
                <ErrorMessage message={(error as any)?.message || "Failed to load overdue tasks"} retry={refetch} />
              ) : overdue?.length === 0 ? (
                <EmptyState icon={<CheckCircle2 size={32} />} title="No Overdue Tasks" message="All tasks are on track!" />
              ) : (
                <>
                  {/* Risk Level Summary Bar */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-6 shadow-sm">
                    <h3 className="text-[14px] font-semibold text-[#111827] mb-3 uppercase tracking-wide flex items-center gap-2">
                      <ShieldAlert size={16} className="text-red-500" /> Risk Severity Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                        <div>
                          <p className="text-[12px] font-bold text-amber-800 uppercase tracking-wider">Low Risk (&lt; 7 Days)</p>
                          <p className="text-[28px] font-extrabold text-amber-700 leading-tight mt-1">{riskCounts.low}</p>
                        </div>
                        <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50/70 border border-orange-200">
                        <div>
                          <p className="text-[12px] font-bold text-orange-800 uppercase tracking-wider">Medium Risk (7 - 13 Days)</p>
                          <p className="text-[28px] font-extrabold text-orange-700 leading-tight mt-1">{riskCounts.medium}</p>
                        </div>
                        <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/70 border border-red-200">
                        <div>
                          <p className="text-[12px] font-bold text-red-800 uppercase tracking-wider">High Risk (14+ Days)</p>
                          <p className="text-[28px] font-extrabold text-red-700 leading-tight mt-1">{riskCounts.high}</p>
                        </div>
                        <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Task Risk Cards */}
                  <div className="space-y-5">
                    {overdue.map((task: Task) => {
                      const daysOverdue = Math.max(1, Math.ceil((Date.now() - new Date(task.dueDate).getTime()) / 86400000));
                      const risk = riskCategorization(daysOverdue);
                      const aiSuggestion = AI_CORRECTIVE_ACTIONS[task.id] || "AI Suggestion: Re-balance workload and set daily progress check-ins with assignee.";
                      const history = escalationLogs[task.id] || [];

                      return (
                        <div key={task.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Badges */}
                              <div className="flex items-center gap-2 mb-2">
                                <PriorityBadge priority={task.priority} />
                                <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-lg ${risk.style}`}>
                                  {risk.level}
                                </span>
                                <span className="text-[12px] text-gray-500 font-mono">ID: {task.id}</span>
                              </div>

                              <h3 className="text-[17px] font-bold text-[#111827] mb-1">{task.title}</h3>
                              <p className="text-[13px] text-[#6B7280] mb-4 leading-relaxed">{task.description}</p>

                              {/* Meta row */}
                              <div className="flex items-center gap-6 mb-4">
                                <div className="flex items-center gap-2">
                                  <img src={task.assigneeAvatar || "https://i.pravatar.cc/150"} alt={task.assignee} className="w-7 h-7 rounded-full object-cover" />
                                  <div>
                                    <p className="text-[11px] text-[#9CA3AF]">Assigned Person</p>
                                    <p className="text-[13px] font-semibold text-[#374151]">{task.assignee}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[11px] text-[#9CA3AF]">Due Date</p>
                                  <p className="text-[13px] font-semibold text-red-600">
                                    {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock size={14} className="text-red-500" />
                                  <div>
                                    <p className="text-[11px] text-[#9CA3AF]">Days Overdue</p>
                                    <p className="text-[13px] font-extrabold text-red-600">{daysOverdue} days</p>
                                  </div>
                                </div>
                              </div>

                              {/* AI Corrective Action Box */}
                              <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 mb-4">
                                <div className="flex items-center gap-1.5 text-purple-800 font-semibold text-[12px] mb-1">
                                  <Sparkles size={13} className="text-purple-600" />
                                  AI Corrective Action Suggestion
                                </div>
                                <p className="text-[13px] text-purple-900 leading-snug">{aiSuggestion}</p>
                              </div>

                              {/* Escalation History Log Section */}
                              {history.length > 0 && (
                                <div className="mb-4">
                                  <button
                                    onClick={() => setActiveHistoryTaskId(activeHistoryTaskId === task.id ? null : task.id)}
                                    className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:underline"
                                  >
                                    <History size={13} /> {history.length} Escalation Log{history.length !== 1 ? "s" : ""}
                                  </button>

                                  {activeHistoryTaskId === task.id && (
                                    <div className="mt-2 space-y-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                                      {history.map((log) => (
                                        <div key={log.id} className="text-[12px] text-gray-700 border-b border-gray-200 last:border-0 pb-1.5 last:pb-0">
                                          <div className="flex justify-between font-semibold">
                                            <span>Notified: {log.managerNotified}</span>
                                            <span className="text-gray-400">{log.timestamp}</span>
                                          </div>
                                          <p className="text-gray-600 mt-0.5">{log.notes}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Status change buttons */}
                              <div>
                                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-2">Update Status</p>
                                <div className="flex gap-2 flex-wrap">
                                  {STATUS_OPTIONS.map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => changeStatus(task.id, s)}
                                      disabled={updateStatusMutation.isPending}
                                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                                        task.status === s ? STATUS_STYLE[s] : "border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:opacity-50"
                                      }`}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleSendReminder(task.id)}
                                className="flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                              >
                                {remindedTasks[task.id] ? <CheckCircle2 size={14} className="text-green-600" /> : <Bell size={14} />}
                                {remindedTasks[task.id] ? "Sent!" : "Remind"}
                              </button>
                              <button
                                onClick={() => setSelectedTaskForEscalation(task)}
                                className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-[13px] font-semibold shadow-sm transition-colors"
                              >
                                <ArrowUpRight size={14} /> Escalate Task
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
          </div>

          {/* Escalation Modal */}
          {selectedTaskForEscalation && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-[18px]">
                    <ShieldAlert size={20} /> Escalate Overdue Task
                  </div>
                  <button onClick={() => setSelectedTaskForEscalation(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-[12px] font-bold text-red-800">Target Task</p>
                    <p className="text-[14px] font-semibold text-red-900">{selectedTaskForEscalation.title}</p>
                    <p className="text-[12px] text-red-700 mt-1">Assignee: {selectedTaskForEscalation.assignee}</p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Select Manager to Notify</label>
                    <select
                      value={managerInput}
                      onChange={(e) => setManagerInput(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-[14px] outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Vikram Executive (VP Eng)">Vikram Executive (VP Eng)</option>
                      <option value="Ananya Roy (Head of Infra)">Ananya Roy (Head of Infra)</option>
                      <option value="Siddharth Rao (Engineering Director)">Siddharth Rao (Engineering Director)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Escalation Notes / Justification</label>
                    <textarea
                      rows={3}
                      value={escalationNotes}
                      onChange={(e) => setEscalationNotes(e.target.value)}
                      placeholder="Specify reasons for delay and required resource escalation..."
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[13px] outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setSelectedTaskForEscalation(null)}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[14px] font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmEscalation}
                      disabled={escalateTaskMutation.isPending}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[14px] font-semibold shadow-md transition-colors disabled:opacity-50"
                    >
                      <Send size={14} /> {escalateTaskMutation.isPending ? "Escalating..." : "Confirm Escalation"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
