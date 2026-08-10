import { useMemo, useState } from "react";
import { ClipboardList, RefreshCw, CheckCircle2, AlertOctagon, Calendar, Filter, ChevronDown, User, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import StatsCard from "../components/dashboard/StatsCard";
import ProductivityChart from "../components/dashboard/LineChart";
import StatusAllocation from "../components/dashboard/StatusAllocation";
import RecentTasks from "../components/dashboard/RecentTasks";
import AIInsights from "../components/dashboard/AIInsights";
import { LoadingSpinner, ErrorMessage } from "../components/common/UIStates";
import {
  useDashboardSummary,
  useResourceUtilisation,
  useSLACompliance,
  useRiskPredictions,
  useIndividualPerformance
} from "../hooks/useApi";

type Status = "Pending" | "In Progress" | "Completed" | "Overdue";

const ranges = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "All Time", days: Infinity },
];
const statuses: (Status | "All")[] = ["All", "Pending", "In Progress", "Completed", "Overdue"];

const CHART_STYLE = {
  contentStyle: { borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13 },
};

export default function Dashboard() {
  const [range, setRange] = useState(ranges[0]);
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [showRanges, setShowRanges] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // API Hooks
  const { data: summaryData, isLoading: isLoadingSummary, error: summaryError, refetch: refetchSummary } = useDashboardSummary();
  const { data: resourceData, isLoading: isLoadingResource } = useResourceUtilisation();
  const { data: slaData, isLoading: isLoadingSla } = useSLACompliance();
  const { data: riskData, isLoading: isLoadingRisk } = useRiskPredictions();
  const { data: performanceData, isLoading: isLoadingPerf } = useIndividualPerformance();

  const dashboardTasks = summaryData?.tasks || [];
  const resourceUtilisationData = resourceData || [];
  const slaComplianceDonut = slaData || [];
  const riskPredictions7Days = riskData || [];
  const individualPerformanceData = performanceData || [];

  const visibleTasks = useMemo(() => {
    if (!dashboardTasks.length) return [];
    const newestDate = new Date(Math.max(...dashboardTasks.map((task: any) => new Date(task.dueDate).getTime())));
    const cutoff = new Date(newestDate);
    cutoff.setDate(cutoff.getDate() - range.days + 1);
    return dashboardTasks.filter((task: any) => (range.days === Infinity || new Date(task.dueDate) >= cutoff) && (statusFilter === "All" || task.status === statusFilter));
  }, [range, statusFilter, dashboardTasks]);

  const count = (status: Status) => visibleTasks.filter((task: any) => task.status === status).length;

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827] leading-tight">Executive AI Dashboard</h1>
              <p className="text-[15px] text-[#6B7280] mt-1">Showing {visibleTasks.length} task{visibleTasks.length !== 1 ? "s" : ""} for {range.label.toLowerCase()}.</p>
            </div>
            <div className="flex items-center gap-2 mt-1 relative">
              <div className="relative">
                <button onClick={() => { setShowRanges(!showRanges); setShowFilters(false); }} className="flex items-center gap-2 border border-[#E5E7EB] bg-white text-[14px] font-medium text-[#374151] px-3.5 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors">
                  <Calendar size={15} className="text-[#6B7280]" />{range.label}<ChevronDown size={14} />
                </button>
                {showRanges && <div className="absolute right-0 mt-2 z-20 w-40 bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-1">
                  {ranges.map((item) => <button key={item.label} onClick={() => { setRange(item); setShowRanges(false); }} className={`w-full text-left px-3 py-2 rounded-md text-[13px] ${range.label === item.label ? "bg-blue-50 text-blue-700 font-semibold" : "text-[#374151] hover:bg-gray-50"}`}>{item.label}</button>)}
                </div>}
              </div>
              <div className="relative">
                <button onClick={() => { setShowFilters(!showFilters); setShowRanges(false); }} className="flex items-center gap-2 border border-[#E5E7EB] bg-white text-[14px] font-medium text-[#374151] px-3.5 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors">
                  <Filter size={15} className="text-[#6B7280]" />{statusFilter === "All" ? "Filter" : statusFilter}<ChevronDown size={14} />
                </button>
                {showFilters && <div className="absolute right-0 mt-2 z-20 w-40 bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-1">
                  {statuses.map((status) => <button key={status} onClick={() => { setStatusFilter(status); setShowFilters(false); }} className={`w-full text-left px-3 py-2 rounded-md text-[13px] ${statusFilter === status ? "bg-blue-50 text-blue-700 font-semibold" : "text-[#374151] hover:bg-gray-50"}`}>{status}</button>)}
                </div>}
              </div>
            </div>
          </div>

          {isLoadingSummary ? (
            <LoadingSpinner message="Loading dashboard statistics..." />
          ) : summaryError ? (
            <ErrorMessage message={summaryError.message} retry={refetchSummary} />
          ) : (
            <>
              {/* Top Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <StatsCard title="Total Tasks" value={visibleTasks.length} icon={<ClipboardList size={17} />} iconColor="text-[#6B7280] bg-[#F3F4F6]" trend={range.label} trendUp />
                <StatsCard title="In Progress" value={count("In Progress")} icon={<RefreshCw size={17} />} iconColor="text-[#6B7280] bg-[#F3F4F6]" trendLabel="Active" />
                <StatsCard title="Completed" value={count("Completed")} icon={<CheckCircle2 size={17} />} iconColor="text-[#6B7280] bg-[#F3F4F6]" trendLabel="Done" />
                <StatsCard title="Overdue" value={count("Overdue")} icon={<AlertOctagon size={17} />} iconColor="text-red-500 bg-red-50" trendLabel="Needs attention" />
              </div>

              {/* Team Productivity & Status Allocation */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2"><ProductivityChart /></div>
                <div className="col-span-1"><StatusAllocation tasks={visibleTasks} /></div>
              </div>

              {/* Resource Utilisation & SLA Donut Chart */}
              <div className="grid grid-cols-3 gap-4">
                {/* Resource Utilisation */}
                <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-[17px] font-bold text-[#111827]">Resource Utilisation</h3>
                    <p className="text-[13px] text-[#6B7280]">Actual department workloads vs capacity ceiling</p>
                  </div>
                  {isLoadingResource ? <LoadingSpinner /> : (
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={resourceUtilisationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="department" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip {...CHART_STYLE} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="capacity" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Capacity Target" />
                        <Bar dataKey="actual" fill="#2563EB" radius={[4, 4, 0, 0]} name="Actual Workload %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* SLA Compliance Donut */}
                <div className="col-span-1 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm flex flex-col">
                  <div className="mb-2">
                    <h3 className="text-[17px] font-bold text-[#111827] flex items-center gap-1.5">
                      <ShieldCheck size={18} className="text-green-600" /> SLA Compliance
                    </h3>
                    <p className="text-[13px] text-[#6B7280]">Met vs Breached task SLAs</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    {isLoadingSla ? <LoadingSpinner /> : (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={slaComplianceDonut} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                            {slaComplianceDonut.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip {...CHART_STYLE} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Prediction Cards (Next 7 Days) */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#111827] flex items-center gap-2">
                      <AlertTriangle size={18} className="text-amber-500" /> AI Risk Predictions (Next 7 Days)
                    </h3>
                    <p className="text-[13px] text-[#6B7280]">Predictive alerts for potential task delays & bottlenecks</p>
                  </div>
                  <span className="text-[12px] bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200">
                    {riskPredictions7Days.length} Alerts
                  </span>
                </div>
                {isLoadingRisk ? <LoadingSpinner /> : (
                  <div className="grid grid-cols-3 gap-4">
                    {riskPredictions7Days.map((risk: any) => (
                      <div key={risk.id} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-amber-50/40 border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                            {risk.severity} Severity
                          </span>
                          <span className="text-[11px] text-gray-500 font-semibold">{risk.id}</span>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-1">{risk.taskTitle}</h4>
                        <p className="text-[12px] text-red-700 font-medium mb-2">{risk.riskFactor}</p>
                        <div className="p-2.5 bg-white rounded-lg border border-amber-100 text-[12px] text-gray-700">
                          <span className="font-bold text-purple-700">Action: </span>
                          {risk.suggestedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Individual Performance Table */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-[17px] font-bold text-[#111827] flex items-center gap-2">
                    <User size={18} className="text-blue-600" /> Individual Performance Metrics
                  </h3>
                  <p className="text-[13px] text-[#6B7280]">Tasks completed, overdue rate, SLA compliance %, and avg completion duration</p>
                </div>
                {isLoadingPerf ? <LoadingSpinner /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Team Member</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Completed</th>
                          <th className="py-3 px-4">Overdue Rate</th>
                          <th className="py-3 px-4">SLA Compliance</th>
                          <th className="py-3 px-4">Avg Completion Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[13px]">
                        {individualPerformanceData.map((member: any) => (
                          <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img src={member.avatar || "https://i.pravatar.cc/150"} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                              <div>
                                <p className="font-semibold text-gray-900">{member.name}</p>
                                <p className="text-[11px] text-gray-400">{member.id}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-700">{member.department}</td>
                            <td className="py-3 px-4 font-bold text-blue-600">{member.tasksCompleted} tasks</td>
                            <td className="py-3 px-4">
                              <span className={`font-semibold px-2 py-0.5 rounded text-[12px] ${member.overdueRate > 10 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                                {member.overdueRate}%
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">{member.slaCompliance}%</td>
                            <td className="py-3 px-4 font-semibold text-gray-600">{member.avgCompletionTimeDays} days</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Tasks & AI Insights Briefing */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2"><RecentTasks tasks={visibleTasks} /></div>
                <div className="col-span-1"><AIInsights /></div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

