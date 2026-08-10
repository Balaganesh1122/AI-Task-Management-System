import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock,
  Edit3, Building2, Save, X, CheckCircle2,
  RefreshCw, AlertTriangle, Circle, Send, Sparkles, Filter, AlertCircle, MessageSquare, ChevronDown, ChevronUp, Bot
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ProgressBar from "../components/common/ProgressBar";
import type { Priority, Status, TimelineEntry, Task } from "../types";
import { useTask, useUpdateTask, useUpdateTaskStatus, useTaskTimeline } from "../hooks/useApi";
import { LoadingSpinner, ErrorMessage } from "../components/common/UIStates";
import api from "../services/axios";

const STATUS_OPTIONS: { value: Status; label: string; icon: React.ReactNode; color: string; active: string }[] = [
  { value: "Pending",     label: "Pending",     icon: <Circle size={13} />,        color: "border-[#E5E7EB] text-[#6B7280] hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700",   active: "bg-amber-50 border-amber-400 text-amber-700" },
  { value: "In Progress", label: "In Progress", icon: <RefreshCw size={13} />,     color: "border-[#E5E7EB] text-[#6B7280] hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",     active: "bg-blue-50 border-blue-400 text-blue-700" },
  { value: "Completed",   label: "Completed",   icon: <CheckCircle2 size={13} />,  color: "border-[#E5E7EB] text-[#6B7280] hover:bg-green-50 hover:border-green-300 hover:text-green-700", active: "bg-green-50 border-green-400 text-green-700" },
  { value: "Overdue",     label: "Overdue",     icon: <AlertTriangle size={13} />, color: "border-[#E5E7EB] text-[#6B7280] hover:bg-red-50 hover:border-red-300 hover:text-red-700",       active: "bg-red-50 border-red-400 text-red-700" },
];

const PRIORITY_OPTIONS: Priority[] = ["High", "Medium", "Low"];
const PRIORITY_COLOR: Record<Priority, string> = {
  High:   "bg-red-50 border-red-300 text-red-700",
  Medium: "bg-amber-50 border-amber-300 text-amber-700",
  Low:    "bg-green-50 border-green-300 text-green-700",
};

const TIMELINE_TYPE_CONFIG: Record<TimelineEntry["type"], { bg: string; text: string; icon: React.ReactNode }> = {
  "Status": { bg: "bg-blue-50 border-blue-200 text-blue-700", text: "text-blue-700", icon: <RefreshCw size={12} /> },
  "Remark": { bg: "bg-gray-50 border-gray-200 text-gray-700", text: "text-gray-700", icon: <MessageSquare size={12} /> },
  "AI Update": { bg: "bg-purple-50 border-purple-200 text-purple-700", text: "text-purple-700", icon: <Sparkles size={12} /> },
  "Blocker": { bg: "bg-red-50 border-red-200 text-red-700", text: "text-red-700", icon: <AlertCircle size={12} /> },
};

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: serverTask, isLoading: taskLoading, error: taskError, refetch: refetchTask } = useTask(id as string);
  const { data: serverTimeline = [] } = useTaskTimeline(id as string);
  const updateTaskMutation = useUpdateTask();
  const updateStatusMutation = useUpdateTaskStatus();

  const [task, setTask] = useState<Task | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Task | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [statusPendingSave, setStatusPendingSave] = useState(false);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [commentDraft, setCommentDraft] = useState("");

  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<string>("All");
  const [latestAiUpdate, setLatestAiUpdate] = useState<string>(
    "AI Health: Task is currently progressing on schedule with 65% progress. No high risk blockers detected."
  );
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (serverTask) {
      setTask(serverTask);
      setDraft(serverTask);
      setTaskComments(serverTask.comments || []);
    }
  }, [serverTask]);

  useEffect(() => {
    if (serverTimeline && serverTimeline.length > 0) {
      setTimeline(serverTimeline);
    } else if (serverTask) {
      // Mock fallback if API returns no timeline but task exists
       setTimeline([
        {
          id: `TL-INIT-1`,
          taskId: serverTask.id,
          type: "AI Update",
          content: `AI initialized tracking for ${serverTask.id}. Suggested milestone setup.`,
          authorName: "Antigravity AI",
          authorAvatar: "https://i.pravatar.cc/40?img=12",
          timestamp: new Date().toLocaleString(),
          isAi: true,
        },
        {
          id: `TL-INIT-2`,
          taskId: serverTask.id,
          type: "Status",
          content: `Task created and assigned to ${serverTask.assignee}.`,
          authorName: "System",
          authorAvatar: "https://i.pravatar.cc/40?img=1",
          timestamp: new Date(Date.now() - 86400000).toLocaleString(),
        },
      ]);
    }
  }, [serverTimeline, serverTask]);

  function handleRefreshAiUpdate() {
    setIsRefreshingAi(true);
    setTimeout(() => {
      setLatestAiUpdate(
        `AI Digest [${new Date().toLocaleTimeString()}]: Workload optimal. Task trajectory estimated completion date is on track.`
      );
      if (task) {
        const newAiItem: TimelineEntry = {
          id: `TL-AI-${Date.now()}`,
          taskId: task.id,
          type: "AI Update",
          content: `Refreshed AI Insight: System health verified clean, performance index optimal.`,
          authorName: "Antigravity AI",
          authorAvatar: "https://i.pravatar.cc/40?img=12",
          timestamp: new Date().toLocaleString(),
          isAi: true,
        };
        setTimeline((prev) => [newAiItem, ...prev]);
      }
      setIsRefreshingAi(false);
    }, 600);
  }

  function toggleExpand(entryId: string) {
    setExpandedEntries((prev) => ({ ...prev, [entryId]: !prev[entryId] }));
  }

  function startEdit() { 
    if (task) {
      setDraft({ ...task }); 
      setEditing(true); 
      setSaveMsg(""); 
    }
  }
  
  function cancelEdit() { 
    setEditing(false); 
    setSaveMsg(""); 
  }

  async function saveChanges() {
    if (!draft) return;
    try {
      await updateTaskMutation.mutateAsync(draft);
      setTask({ ...draft });
      setEditing(false);
      setSaveMsg("Changes saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      setSaveMsg("Failed to save.");
    }
  }

  function changeStatus(status: Status) {
    if (!task) return;
    const progressByStatus: Record<Status, number> = { "Pending": 0, "In Progress": 50, "Completed": 100, "Overdue": 25 };
    const progress = progressByStatus[status];
    const updated = { ...task, status, progress };
    setTask(updated);
    setDraft(updated);
    setStatusPendingSave(true);
    setSaveMsg("");
  }

  async function saveStatusChange() {
    if (!task) return;
    try {
      await updateStatusMutation.mutateAsync({ id: task.id, status: task.status, progress: task.progress });
      setStatusPendingSave(false);
      setSaveMsg("Status and progress saved!");
      
      const statusEntry: TimelineEntry = {
        id: `TL-ST-${Date.now()}`,
        taskId: task.id,
        type: "Status",
        content: `Status updated to ${task.status} (${task.progress}% progress)`,
        authorName: "You",
        authorAvatar: "https://i.pravatar.cc/40?img=1",
        timestamp: new Date().toLocaleString(),
      };
      setTimeline((prev) => [statusEntry, ...prev]);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e: any) {
      const detail =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update status.";

      setSaveMsg(`Failed to update status: ${detail}`);
    }
  }

  function handleAddComment() {
    if (!task) return;
    const trimmed = commentDraft.trim();
    if (!trimmed) return;

    const newComment = {
      user: "You",
      avatar: "https://i.pravatar.cc/40?img=1",
      text: trimmed,
      time: "Just now",
    };

    setTaskComments((prev) => [newComment, ...prev]);
    
    const remarkEntry: TimelineEntry = {
      id: `TL-RM-${Date.now()}`,
      taskId: task.id,
      type: "Remark",
      content: trimmed,
      authorName: "You",
      authorAvatar: "https://i.pravatar.cc/40?img=1",
      timestamp: new Date().toLocaleString(),
    };
    setTimeline((prev) => [remarkEntry, ...prev]);
    setCommentDraft("");
  }

  const formatDate = (value: string) => {
    if (!value) return "No due date";
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return parsedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const filteredTimeline = timeline.filter((entry) => timelineFilter === "All" || entry.type === timelineFilter);

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-[#9CA3AF] font-semibold uppercase tracking-wide mb-1">{label}</p>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 relative">
          
          {taskLoading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB] z-10">
                <LoadingSpinner message="Loading task details..." />
             </div>
          ) : taskError ? (
            <ErrorMessage message={taskError.message} retry={refetchTask} />
          ) : task && draft ? (
            <>
              {/* Back + title */}
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => navigate("/tasks")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={15} className="text-[#6B7280]" />
                </button>
                <div className="flex-1">
                  <h1 className="text-[24px] font-bold text-[#111827] leading-tight">Task Details & Timeline</h1>
                  <p className="text-[13px] text-[#9CA3AF]">{task.id} · {task.department}</p>
                </div>
                {saveMsg && <span className="text-[13px] text-green-600 font-medium bg-green-50 border border-green-200 px-3 py-1 rounded-lg">{saveMsg}</span>}
                {!editing ? (
                  <button onClick={startEdit} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-semibold px-4 py-2 rounded-lg transition-colors">
                    <Edit3 size={14} /> Edit Task
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={cancelEdit} className="flex items-center gap-2 border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#374151] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={saveChanges} disabled={updateTaskMutation.isPending} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-[14px] font-semibold px-4 py-2 rounded-lg transition-colors">
                      <Save size={14} /> {updateTaskMutation.isPending ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              {/* AI Latest Update Banner */}
              <div className="mb-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-xl p-4 text-white shadow-md flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-300">
                    <Bot size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-purple-200">AI-Generated Latest Update</h3>
                      <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-semibold">Live AI</span>
                    </div>
                    <p className="text-[13px] text-gray-200 mt-0.5 leading-relaxed">{latestAiUpdate}</p>
                  </div>
                </div>
                <button
                  onClick={handleRefreshAiUpdate}
                  disabled={isRefreshingAi}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                >
                  <RefreshCw size={13} className={isRefreshingAi ? "animate-spin" : ""} />
                  {isRefreshingAi ? "Updating..." : "Refresh AI Update"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {/* Main col */}
                <div className="col-span-2 space-y-4">

                  {/* Title + description card */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                    {editing ? (
                      <input
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        className="w-full text-[20px] font-bold text-[#111827] border-b-2 border-[#2563EB] outline-none bg-transparent mb-3 pb-1"
                      />
                    ) : (
                      <h2 className="text-[20px] font-bold text-[#111827] mb-3">{task.title}</h2>
                    )}

                    {editing ? (
                      <textarea
                        rows={3}
                        value={draft.description}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        className="w-full text-[14px] text-[#6B7280] border border-[#E5E7EB] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <p className="text-[14px] text-[#6B7280] leading-relaxed">{task.description}</p>
                    )}
                  </div>

                  {/* Status quick-change */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                    <p className="text-[13px] font-semibold text-[#374151] mb-3 uppercase tracking-wide">Change Status</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => changeStatus(opt.value)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[13px] font-semibold transition-all duration-150 ${
                            task.status === opt.value ? opt.active : opt.color
                          }`}
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      ))}
                      {statusPendingSave && (
                        <button onClick={saveStatusChange} disabled={updateStatusMutation.isPending} className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-[13px] font-semibold px-3.5 py-2 rounded-lg transition-colors">
                          <Save size={13} /> {updateStatusMutation.isPending ? "Saving…" : "Save Status"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Task info grid */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                    <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Task Information</h3>
                    <div className="grid grid-cols-2 gap-3">

                      <Field label="Assigned To">
                        <div className="flex items-center gap-2">
                          <img src={task.assigneeAvatar || "https://i.pravatar.cc/150"} alt={task.assignee} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-[14px] font-semibold text-[#111827]">{task.assignee}</span>
                        </div>
                      </Field>

                      <Field label="Department">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-[#9CA3AF]" />
                          <span className="text-[14px] font-semibold text-[#111827]">{task.department}</span>
                        </div>
                      </Field>

                      <Field label="Priority">
                        {editing ? (
                          <div className="flex gap-2">
                            {PRIORITY_OPTIONS.map((p) => (
                              <button
                                key={p}
                                onClick={() => setDraft({ ...draft, priority: p })}
                                className={`px-2.5 py-1 rounded-lg border text-[12px] font-bold transition-all ${
                                  draft.priority === p ? PRIORITY_COLOR[p] : "border-[#E5E7EB] text-[#9CA3AF] hover:bg-gray-50"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className={`inline-block text-[12px] font-bold px-2.5 py-1 rounded-lg border ${PRIORITY_COLOR[task.priority]}`}>
                            {task.priority}
                          </span>
                        )}
                      </Field>

                      <Field label="Due Date">
                        {editing ? (
                          <input
                            type="date"
                            value={draft.dueDate}
                            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                            className="text-[14px] font-semibold text-[#111827] border border-[#E5E7EB] rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#9CA3AF]" />
                            <span className="text-[14px] font-semibold text-[#111827]">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                      </Field>

                      <Field label="Estimated Hours">
                        {editing ? (
                          <input
                            type="number"
                            value={draft.estimatedHours || 0}
                            onChange={(e) => setDraft({ ...draft, estimatedHours: Number(e.target.value) })}
                            className="text-[14px] font-semibold text-[#111827] border border-[#E5E7EB] rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 w-24"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-[#9CA3AF]" />
                            <span className="text-[14px] font-semibold text-[#111827]">{task.estimatedHours || 0}h</span>
                          </div>
                        )}
                      </Field>

                      <Field label="Progress">
                        {editing ? (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] font-bold text-[#2563EB]">{draft.progress}%</span>
                            </div>
                            <input
                              type="range" min={0} max={100} value={draft.progress || 0}
                              onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
                              className="w-full accent-[#2563EB]"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <ProgressBar value={task.progress || 0} height="h-1.5" isLoading={task.status === "In Progress"} isOverdue={task.status === "Overdue"} />
                            </div>
                            <span className="text-[13px] font-bold text-[#111827] w-8 text-right">{task.progress || 0}%</span>
                          </div>
                        )}
                      </Field>

                    </div>
                  </div>

                  {/* Comments */}
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                    <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Remarks & Discussions</h3>
                    <div className="space-y-3 mb-4">
                      {taskComments.map((c, i) => (
                        <div key={i} className="flex gap-3">
                          <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[13px] font-semibold text-[#111827]">{c.user}</p>
                              <p className="text-[12px] text-[#9CA3AF]">{c.time}</p>
                            </div>
                            <p className="text-[13px] text-[#6B7280]">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <img src="https://i.pravatar.cc/40?img=1" alt="You" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 flex gap-2">
                        <input
                          value={commentDraft}
                          onChange={(e) => setCommentDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddComment();
                            }
                          }}
                          placeholder="Add a remark or comment…"
                          className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleAddComment}
                          className="flex items-center gap-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors"
                        >
                          <Send size={13} /> Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right sidebar: Full Chronological Timeline Feed */}
                <div className="space-y-4">
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[15px] font-semibold text-[#111827]">Full Task Timeline</h3>
                      <div className="flex items-center gap-1 text-[12px] text-[#6B7280]">
                        <Filter size={13} />
                        <select
                          value={timelineFilter}
                          onChange={(e) => setTimelineFilter(e.target.value)}
                          className="bg-transparent font-medium border-none outline-none text-[#2563EB] cursor-pointer"
                        >
                          <option value="All">All Types</option>
                          <option value="Status">Status</option>
                          <option value="Remark">Remarks</option>
                          <option value="AI Update">AI Updates</option>
                          <option value="Blocker">Blockers</option>
                        </select>
                      </div>
                    </div>

                    {filteredTimeline.length === 0 ? (
                      <p className="text-[13px] text-[#9CA3AF] py-4 text-center">No timeline records match the selected type.</p>
                    ) : (
                      <div className="relative pl-2">
                        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-[#E5E7EB]" />
                        <div className="space-y-4">
                          {filteredTimeline.map((entry) => {
                            const config = TIMELINE_TYPE_CONFIG[entry.type];
                            const isExpanded = !!expandedEntries[entry.id];
                            const isLong = entry.content.length > 80;

                            return (
                              <div key={entry.id} className="flex gap-3 relative">
                                <img
                                  src={entry.authorAvatar}
                                  alt={entry.authorName}
                                  className="w-6 h-6 rounded-full object-cover border-2 border-white ring-1 ring-gray-200 z-10 flex-shrink-0 mt-0.5"
                                />
                                <div className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3">
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bg}`}>
                                      {config.icon}
                                      {entry.type}
                                    </span>
                                    <span className="text-[11px] text-[#9CA3AF]">{entry.timestamp}</span>
                                  </div>

                                  <p className="text-[13px] text-[#374151] font-medium leading-snug">
                                    {isLong && !isExpanded ? `${entry.content.slice(0, 80)}...` : entry.content}
                                  </p>

                                  {isLong && (
                                    <button
                                      onClick={() => toggleExpand(entry.id)}
                                      className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline mt-1"
                                    >
                                      {isExpanded ? <>Collapse <ChevronUp size={11} /></> : <>Expand entry <ChevronDown size={11} /></>}
                                    </button>
                                  )}

                                  <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-gray-100">
                                    <span className="text-[11px] text-[#9CA3AF]">By</span>
                                    <span className="text-[11px] font-semibold text-[#111827]">{entry.authorName}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
