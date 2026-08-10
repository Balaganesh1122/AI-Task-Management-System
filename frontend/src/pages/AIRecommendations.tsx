import { useState } from "react";
import {
  Sparkles, UserCheck, Zap, Clock, TrendingUp,
  BarChart3, ListTodo, Brain, AlertTriangle,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { useUsers, useTasks } from "../hooks/useApi";
import { LoadingSpinner, ErrorMessage } from "../components/common/UIStates";
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

interface AICardProps {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  confidence: number;
  children: React.ReactNode;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}

function AICard({ id, icon, iconBg, title, confidence, children, onAccept, onDismiss }: AICardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)] transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
          <Brain size={11} className="text-purple-600" />
          <span className="text-[11px] font-bold text-purple-700">{confidence}%</span>
        </div>
      </div>
      {children}
      <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center justify-end gap-2">
        <button onClick={() => onDismiss(id)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Dismiss</button>
        <button onClick={() => onAccept(id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">Accept Suggestion</button>
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#9CA3AF]">AI Confidence</span>
        <span className="text-xs font-bold text-purple-700">{value}%</span>
      </div>
      <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function AIRecommendations() {
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useTasks();

  const isLoading = usersLoading || tasksLoading;
  const isError = usersError || tasksError;

  const suggested = (users || []).find((m: TeamMember) => m.availability === "Available" && m.workload < 60);
  const atRisk = (tasks || []).filter((t: Task) => t.status === "In Progress" && t.progress < 50);

  const [cards, setCards] = useState([
    { id: 'assignee', visible: true },
    { id: 'priority', visible: true },
    { id: 'delay', visible: true },
    { id: 'completion', visible: true },
    { id: 'workload', visible: true },
    { id: 'breakdown', visible: true },
    { id: 'insights', visible: true },
  ]);

  const handleDismiss = (id: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, visible: false } : c));
  };

  const handleAccept = (id: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, visible: false } : c));
    // In a real app, this would trigger some action via API
  };

  const isVisible = (id: string) => cards.find(c => c.id === id)?.visible;

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 relative">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-[28px] font-bold text-[#111827]">AI Recommendations</h1>
            <p className="text-[14px] text-[#9CA3AF] mt-1">Intelligent insights powered by AI to optimize your team's performance.</p>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
            <Sparkles size={15} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">AI Engine Active</span>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB] z-10">
              <LoadingSpinner message="Generating AI Recommendations..." />
            </div>
          ) : isError ? (
            <ErrorMessage message={(usersError || tasksError as any)?.message || "Failed to load data"} retry={() => { refetchUsers(); refetchTasks(); }} />
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Recommended Assignee */}
              {isVisible('assignee') && suggested && (
                <AICard id="assignee" icon={<UserCheck size={18} className="text-blue-600" />} iconBg="bg-blue-50" title="Recommended Assignee" confidence={94} onAccept={handleAccept} onDismiss={handleDismiss}>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={suggested.avatar || "https://i.pravatar.cc/150"} alt={suggested.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{suggested.name}</p>
                      <p className="text-xs text-[#6B7280]">{suggested.role}</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#6B7280]">
                    <li className="flex items-center gap-1.5"><Zap size={11} className="text-blue-500" /> Workload: {suggested.workload}% — optimal</li>
                    <li className="flex items-center gap-1.5"><Zap size={11} className="text-blue-500" /> Skills: {(suggested.skills || []).slice(0, 2).join(", ")}</li>
                    <li className="flex items-center gap-1.5"><Zap size={11} className="text-blue-500" /> {suggested.tasksAssigned} active tasks</li>
                  </ul>
                  <ConfidenceBar value={94} />
                </AICard>
              )}

              {/* Smart Priority */}
              {isVisible('priority') && tasks.length > 0 && (
                <AICard id="priority" icon={<Zap size={18} className="text-amber-600" />} iconBg="bg-amber-50" title="Smart Priority Adjustment" confidence={88} onAccept={handleAccept} onDismiss={handleDismiss}>
                  <div className="space-y-2.5">
                    {tasks.slice(0, 3).map((t: Task) => (
                      <div key={t.id} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl">
                        <p className="text-xs font-medium text-[#374151] truncate flex-1 mr-2">{t.title}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-[#9CA3AF]">{t.priority}</span>
                          <span className="text-[10px] text-[#9CA3AF]">→</span>
                          <span className={`text-[10px] font-bold ${t.priority === "Low" ? "text-amber-600" : "text-green-600"}`}>
                            {t.priority === "Low" ? "Medium" : t.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ConfidenceBar value={88} />
                </AICard>
              )}

              {/* Delay Prediction */}
              {isVisible('delay') && atRisk.length > 0 && (
                <AICard id="delay" icon={<AlertTriangle size={18} className="text-red-600" />} iconBg="bg-red-50" title="Delay Prediction" confidence={82} onAccept={handleAccept} onDismiss={handleDismiss}>
                  <div className="space-y-2.5">
                    {atRisk.map((t: Task) => (
                      <div key={t.id} className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs font-semibold text-[#374151] mb-1">{t.title}</p>
                        <p className="text-[11px] text-red-600">⚠ {100 - t.progress}% remaining — high delay risk</p>
                      </div>
                    ))}
                  </div>
                  <ConfidenceBar value={82} />
                </AICard>
              )}

              {/* Estimated Completion */}
              {isVisible('completion') && (
                <AICard id="completion" icon={<Clock size={18} className="text-green-600" />} iconBg="bg-green-50" title="Estimated Completion" confidence={91} onAccept={handleAccept} onDismiss={handleDismiss}>
                  <div className="space-y-2.5">
                    {tasks.filter((t: Task) => t.status === "In Progress").slice(0, 3).map((t: Task) => (
                      <div key={t.id} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl">
                        <p className="text-xs font-medium text-[#374151] truncate flex-1 mr-2">{t.title}</p>
                        <span className="text-[11px] font-semibold text-green-700 flex-shrink-0">
                          ~{Math.ceil((100 - t.progress) / 10)}d
                        </span>
                      </div>
                    ))}
                  </div>
                  <ConfidenceBar value={91} />
                </AICard>
              )}

              {/* Workload Analysis */}
              {isVisible('workload') && users.length > 0 && (
                <AICard id="workload" icon={<BarChart3 size={18} className="text-purple-600" />} iconBg="bg-purple-50" title="Workload Analysis" confidence={96} onAccept={handleAccept} onDismiss={handleDismiss}>
                  <div className="space-y-3">
                    {users.slice(0, 4).map((m: TeamMember) => (
                      <div key={m.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[#374151]">{m.name}</span>
                          <span className={`text-[11px] font-bold ${m.workload > 80 ? "text-red-600" : m.workload > 60 ? "text-amber-600" : "text-green-600"}`}>
                            {m.workload}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${m.workload > 80 ? "bg-red-500" : m.workload > 60 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${m.workload}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <ConfidenceBar value={96} />
                </AICard>
              )}

              {/* Task Breakdown */}
              {isVisible('breakdown') && (
                <AICard id="breakdown" icon={<ListTodo size={18} className="text-indigo-600" />} iconBg="bg-indigo-50" title="Suggested Task Breakdown" confidence={79} onAccept={handleAccept} onDismiss={handleDismiss}>
                  <p className="text-xs text-[#6B7280] mb-3">AI suggests breaking "AI Recommendation Engine" into:</p>
                  <div className="space-y-2">
                    {[
                      "Data collection & preprocessing",
                      "Model training pipeline",
                      "API endpoint development",
                      "Frontend integration",
                      "Testing & validation",
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2 bg-indigo-50 rounded-lg">
                        <span className="w-5 h-5 bg-indigo-600 text-white rounded-md text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-xs text-[#374151]">{step}</p>
                      </div>
                    ))}
                  </div>
                  <ConfidenceBar value={79} />
                </AICard>
              )}

              {/* Productivity Insights */}
              {isVisible('insights') && (
                <AICard id="insights" icon={<TrendingUp size={18} className="text-teal-600" />} iconBg="bg-teal-50" title="Productivity Insights" confidence={87} onAccept={handleAccept} onDismiss={handleDismiss}>
                  <div className="space-y-3">
                    {[
                      { label: "Peak productivity hours", value: "10 AM – 12 PM", icon: "🕙" },
                      { label: "Best performing day", value: "Thursday", icon: "📅" },
                      { label: "Avg tasks/day", value: "8.4 tasks", icon: "📊" },
                      { label: "Focus recommendation", value: "Reduce context switching", icon: "🎯" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <p className="text-xs text-[#6B7280]">{item.label}</p>
                        </div>
                        <p className="text-xs font-semibold text-[#374151]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <ConfidenceBar value={87} />
                </AICard>
              )}
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}
