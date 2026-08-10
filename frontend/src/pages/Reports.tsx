import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Download, Calendar, Clock, FileSpreadsheet, FileText, CheckCircle2, Filter, Send, X, ShieldCheck } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { useReports, useIndividualPerformance } from "../hooks/useApi";
import { LoadingSpinner, ErrorMessage } from "../components/common/UIStates";

const REPORT_TABS = [
  { id: "Daily", label: "Daily Summary" },
  { id: "Weekly", label: "Weekly Analysis" },
  { id: "Monthly", label: "Monthly Executive" },
  { id: "Employee Performance", label: "Employee Performance" },
  { id: "Project Health", label: "Project Health" },
];

const CHART_STYLE = {
  contentStyle: { borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13 },
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-[18px] font-bold text-[#111827]">{title}</h2>
        {subtitle && <p className="text-sm text-[#6B7280]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("Weekly");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-22");
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState("manager@organization.com");
  const [scheduleFrequency, setScheduleFrequency] = useState("Weekly");
  const [scheduleTime, setScheduleTime] = useState("09:00 AM");
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const { data: reportsData = {}, isLoading: reportsLoading, error: reportsError, refetch: refetchReports } = useReports();
  const { data: individualData = [], isLoading: indLoading, error: indError, refetch: refetchInd } = useIndividualPerformance();

  const isLoading = reportsLoading || indLoading;
  const error = reportsError || indError;

  const productivityData = reportsData?.productivityData || [];
  const weeklyData = reportsData?.weeklyData || [];
  const teamPerformance = reportsData?.teamPerformance || [];
  const priorityDist = reportsData?.priorityDist || [
    { name: "High", value: 4, color: "#EF4444" },
    { name: "Medium", value: 3, color: "#F59E0B" },
    { name: "Low", value: 3, color: "#22C55E" }
  ];

  function handleDownload(type: "excel" | "pdf") {
    setDownloadingFormat(type);
    setTimeout(() => {
      // Create mock file download trigger
      const dummyContent = `AI Task Management Report (${activeTab})\nDate Range: ${startDate} to ${endDate}\nGenerated: ${new Date().toLocaleString()}`;
      const blob = new Blob([dummyContent], { type: type === "excel" ? "application/vnd.ms-excel" : "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Report_${activeTab.replace(/\s+/g, "_")}_${startDate}_to_${endDate}.${type === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadingFormat(null);
    }, 800);
  }

  function handleSaveSchedule() {
    setScheduleSuccess(true);
    setTimeout(() => {
      setScheduleSuccess(false);
      setShowScheduleModal(false);
    }, 1500);
  }

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 relative">

          {/* Title & Controls Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827]">Reports & Analytics</h1>
              <p className="text-[14px] text-[#6B7280] mt-1">Exportable operational summaries and visual intelligence previews.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-[13px] px-4 py-2 rounded-xl transition-colors"
              >
                <Clock size={15} /> Schedule Recurring Report
              </button>
              <button
                onClick={() => handleDownload("excel")}
                disabled={downloadingFormat === "excel"}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                <FileSpreadsheet size={15} /> {downloadingFormat === "excel" ? "Downloading..." : "Export Excel"}
              </button>
              <button
                onClick={() => handleDownload("pdf")}
                disabled={downloadingFormat === "pdf"}
                className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[13px] px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                <FileText size={15} /> {downloadingFormat === "pdf" ? "Downloading..." : "Export PDF"}
              </button>
            </div>
          </div>

          <div className="relative min-h-[400px]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB] z-10">
                <LoadingSpinner message="Loading reports data..." />
              </div>
            ) : error ? (
              <ErrorMessage message={(error as any)?.message || "Failed to load reports"} retry={() => { refetchReports(); refetchInd(); }} />
            ) : (
              <>
                {/* Report Category Tabs & Date Picker */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
                  {/* Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {REPORT_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-[13px] font-bold px-4 py-2 rounded-xl transition-all ${
                          activeTab === tab.id
                            ? "bg-[#2563EB] text-white shadow-sm"
                            : "text-[#6B7280] hover:bg-gray-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Range Selector */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-[13px]">
                    <Calendar size={15} className="text-gray-500" />
                    <span className="font-semibold text-gray-700">Range:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-gray-800 font-semibold outline-none"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-gray-800 font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* Formatted Report Preview Box */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white mb-8 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-widest uppercase bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-400/30">
                      Active Report Preview Mode
                    </span>
                    <span className="text-[12px] text-blue-200 font-mono">Report ID: RPT-2026-{activeTab.toUpperCase()}</span>
                  </div>
                  <h2 className="text-[22px] font-extrabold">{activeTab} Performance Briefing</h2>
                  <p className="text-[14px] text-blue-100 mt-1 max-w-3xl leading-relaxed">
                    Showing compiled executive telemetry for the range <strong className="text-white">{startDate}</strong> through <strong className="text-white">{endDate}</strong>. Includes SLA benchmarks, workload capacity, and overdue metrics.
                  </p>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  {[
                    { label: "Completion Rate", value: `${reportsData?.completionRate || 89}%`, change: "+4%", positive: true },
                    { label: "Avg Task Duration", value: `${reportsData?.avgDuration || 3.2}d`, change: "-0.5d", positive: true },
                    { label: "On-Time Delivery", value: `${reportsData?.onTimeDelivery || 76}%`, change: "+2%", positive: true },
                    { label: "Team Utilization", value: `${reportsData?.teamUtilization || 72}%`, change: "-3%", positive: false },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)] border border-gray-100">
                      <p className="text-sm text-[#6B7280] mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-[#111827]">{kpi.value}</p>
                      <p className={`text-xs font-semibold mt-1 ${kpi.positive ? "text-green-600" : "text-red-500"}`}>
                        {kpi.change} vs last cycle
                      </p>
                    </div>
                  ))}
                </div>

                {/* Conditional content based on activeTab */}
                {activeTab === "Employee Performance" ? (
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-8 shadow-sm">
                    <h2 className="text-[18px] font-bold text-[#111827] mb-4">Detailed Employee Performance Metrics</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50 text-[12px] font-bold text-gray-500 uppercase">
                            <th className="py-3 px-4">Member Name</th>
                            <th className="py-3 px-4">Department</th>
                            <th className="py-3 px-4">Tasks Done</th>
                            <th className="py-3 px-4">Overdue Rate</th>
                            <th className="py-3 px-4">SLA Compliance</th>
                            <th className="py-3 px-4">Avg Speed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-[13px]">
                          {(individualData || []).map((emp: any) => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 flex items-center gap-3">
                                <img src={emp.avatar || "https://i.pravatar.cc/150"} alt={emp.name} className="w-7 h-7 rounded-full object-cover" />
                                <span className="font-semibold text-gray-900">{emp.name}</span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{emp.department}</td>
                              <td className="py-3 px-4 font-bold text-blue-600">{emp.tasksCompleted}</td>
                              <td className="py-3 px-4 font-bold text-red-600">{emp.overdueRate}%</td>
                              <td className="py-3 px-4 font-bold text-green-600">{emp.slaCompliance}%</td>
                              <td className="py-3 px-4 font-semibold text-gray-700">{emp.avgCompletionTimeDays}d</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Row 1 Charts */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <ChartCard title="Monthly Productivity" subtitle="Tasks created vs completed per month">
                        <ResponsiveContainer width="100%" height={240}>
                          <LineChart data={productivityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <Tooltip {...CHART_STYLE} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line type="monotone" dataKey="completed" stroke="#2563EB" strokeWidth={2.5} dot={false} name="Completed" />
                            <Line type="monotone" dataKey="created" stroke="#8B5CF6" strokeWidth={2.5} dot={false} strokeDasharray="5 4" name="Created" />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartCard>

                      <ChartCard title="Weekly Completion" subtitle="Daily task completions this week">
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <Tooltip {...CHART_STYLE} cursor={{ fill: "#F3F4F6" }} />
                            <Bar dataKey="tasks" fill="#2563EB" radius={[6, 6, 0, 0]} name="Tasks" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartCard>
                    </div>

                    {/* Row 2 Charts */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="col-span-2">
                        <ChartCard title="Team Performance" subtitle="Completed, pending, and overdue by department">
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={teamPerformance} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                              <Tooltip {...CHART_STYLE} cursor={{ fill: "#F3F4F6" }} />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Bar dataKey="completed" fill="#22C55E" radius={[4, 4, 0, 0]} name="Completed" stackId="a" />
                              <Bar dataKey="pending" fill="#F59E0B" radius={[0, 0, 0, 0]} name="Pending" stackId="a" />
                              <Bar dataKey="overdue" fill="#EF4444" radius={[4, 4, 0, 0]} name="Overdue" stackId="a" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      </div>

                      <ChartCard title="Priority Distribution" subtitle="Tasks by priority level">
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie data={priorityDist} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                              {priorityDist.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip {...CHART_STYLE} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartCard>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Schedule Recurring Report Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-[18px]">
                    <Clock size={20} /> Schedule Recurring Digest
                  </div>
                  <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>

                {scheduleSuccess ? (
                  <div className="py-8 text-center space-y-2">
                    <CheckCircle2 size={40} className="text-green-600 mx-auto animate-bounce" />
                    <p className="text-[16px] font-bold text-gray-900">Schedule Saved!</p>
                    <p className="text-[13px] text-gray-500">Automated reports will be sent to {scheduleEmail}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={scheduleEmail}
                        onChange={(e) => setScheduleEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-[14px] outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1">Frequency</label>
                      <select
                        value={scheduleFrequency}
                        onChange={(e) => setScheduleFrequency(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-[14px] outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Daily">Daily Morning Digest</option>
                        <option value="Weekly">Weekly Monday Summary</option>
                        <option value="Monthly">Monthly 1st Executive Report</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1">Delivery Time</label>
                      <input
                        type="text"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-[14px] outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        onClick={() => setShowScheduleModal(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[14px] font-semibold hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSchedule}
                        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-[14px] font-semibold shadow-md transition-colors"
                      >
                        <Send size={14} /> Confirm Schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
