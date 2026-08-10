import { useState } from "react";
import {
  Download,
  Calendar,
  Clock,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  X,
  Send,
  BarChart3,
  CheckCircle,
  Circle,
  AlertTriangle,
  Activity,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import {
  useReports,
  useIndividualPerformance,
} from "../hooks/useApi";

import {
  LoadingSpinner,
  ErrorMessage,
} from "../components/common/UIStates";

const REPORT_TABS = [
  { id: "Daily", label: "Daily Summary" },
  { id: "Weekly", label: "Weekly Analysis" },
  { id: "Monthly", label: "Monthly Executive" },
  { id: "Employee Performance", label: "Employee Performance" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("Weekly");

  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-10");

  const [downloadingFormat, setDownloadingFormat] =
    useState<string | null>(null);

  const [showScheduleModal, setShowScheduleModal] =
    useState(false);

  const [scheduleEmail, setScheduleEmail] =
    useState("manager@organization.com");

  const [scheduleFrequency, setScheduleFrequency] =
    useState("Weekly");

  const [scheduleTime, setScheduleTime] =
    useState("09:00 AM");

  const [scheduleSuccess, setScheduleSuccess] =
    useState(false);

  // ---------------------------------------------------------
  // API
  // ---------------------------------------------------------

  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useReports();

  const {
    data: individualData = [],
    isLoading: indLoading,
    error: indError,
    refetch: refetchInd,
  } = useIndividualPerformance();

  const isLoading = reportsLoading || indLoading;
  const error = reportsError || indError;

  // ---------------------------------------------------------
  // Backend report data
  // ---------------------------------------------------------

  const dailySummary = reportsData?.dailySummary || {
    total_tasks: 0,
    completed: 0,
    pending: 0,
    in_progress: 0,
    overdue: 0,
  };

  const weeklySummary = reportsData?.weeklySummary || {
    total_tasks: 0,
    completed: 0,
    pending: 0,
    in_progress: 0,
    overdue: 0,
  };

  const summary =
    activeTab === "Daily"
      ? dailySummary
      : weeklySummary;

  // ---------------------------------------------------------
  // Calculate percentages
  // ---------------------------------------------------------

  const totalTasks = Number(summary.total_tasks || 0);

  const completedTasks = Number(
    summary.completed || 0
  );

  const pendingTasks = Number(
    summary.pending || 0
  );

  const inProgressTasks = Number(
    summary.in_progress || 0
  );

  const overdueTasks = Number(
    summary.overdue || 0
  );

  const completionRate =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const pendingRate =
    totalTasks > 0
      ? Math.round((pendingTasks / totalTasks) * 100)
      : 0;

  const inProgressRate =
    totalTasks > 0
      ? Math.round((inProgressTasks / totalTasks) * 100)
      : 0;

  const overdueRate =
    totalTasks > 0
      ? Math.round((overdueTasks / totalTasks) * 100)
      : 0;

  // ---------------------------------------------------------
  // Download actual backend report
  // ---------------------------------------------------------

  async function handleDownload(
    type: "excel" | "pdf"
  ) {
    try {
      setDownloadingFormat(type);

      const response = await fetch(
        `http://localhost:8000/api/reports/download?type=${type}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status}`
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download =
        type === "excel"
          ? `AI_Task_Report_${activeTab}.xlsx`
          : `AI_Task_Report_${activeTab}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Report download failed:",
        error
      );

      alert(
        "Report download failed. Please check the backend."
      );
    } finally {
      setDownloadingFormat(null);
    }
  }

  // ---------------------------------------------------------
  // Schedule
  // ---------------------------------------------------------

  function handleSaveSchedule() {
    setScheduleSuccess(true);

    setTimeout(() => {
      setScheduleSuccess(false);
      setShowScheduleModal(false);
    }, 1500);
  }

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex bg-[#F9FAFB] min-h-screen">
        <Sidebar />

        <div className="flex-1 ml-[200px]">
          <Header />

          <main className="p-8">
            <LoadingSpinner message="Loading reports data..." />
          </main>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (error) {
    return (
      <div className="flex bg-[#F9FAFB] min-h-screen">
        <Sidebar />

        <div className="flex-1 ml-[200px]">
          <Header />

          <main className="p-8">
            <ErrorMessage
              message={
                (error as any)?.message ||
                "Failed to load reports"
              }
              retry={() => {
                refetchReports();
                refetchInd();
              }}
            />
          </main>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8 overflow-y-auto">

          {/* ------------------------------------------------ */}
          {/* HEADER */}
          {/* ------------------------------------------------ */}

          <div className="flex items-center justify-between mb-6">

            <div>
              <h1 className="text-[28px] font-bold text-[#111827]">
                Reports & Analytics
              </h1>

              <p className="text-[14px] text-[#6B7280] mt-1">
                Operational reports and performance intelligence.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setShowScheduleModal(true)
                }
                className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-[13px] px-4 py-2 rounded-xl"
              >
                <Clock size={15} />

                Schedule Report
              </button>

              <button
                onClick={() =>
                  handleDownload("excel")
                }
                disabled={
                  downloadingFormat === "excel"
                }
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] px-4 py-2 rounded-xl"
              >
                <FileSpreadsheet size={15} />

                {downloadingFormat === "excel"
                  ? "Downloading..."
                  : "Export Excel"}
              </button>

              <button
                onClick={() =>
                  handleDownload("pdf")
                }
                disabled={
                  downloadingFormat === "pdf"
                }
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] px-4 py-2 rounded-xl"
              >
                <FileText size={15} />

                {downloadingFormat === "pdf"
                  ? "Downloading..."
                  : "Export PDF"}
              </button>

            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* TABS + DATE */}
          {/* ------------------------------------------------ */}

          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between flex-wrap gap-4">

            <div className="flex items-center gap-2 overflow-x-auto">

              {REPORT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`text-[13px] font-bold px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">

              <Calendar
                size={15}
                className="text-gray-500"
              />

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="bg-transparent text-sm outline-none"
              />

              <span className="text-gray-400">
                to
              </span>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="bg-transparent text-sm outline-none"
              />

            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* REPORT PREVIEW */}
          {/* ------------------------------------------------ */}

          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white mb-8">

            <div className="flex items-center justify-between">

              <div>

                <span className="inline-block text-[11px] font-bold tracking-widest uppercase bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full">
                  {activeTab} Report
                </span>

                <h2 className="text-[24px] font-extrabold mt-3">
                  {summary.report_type ||
                    activeTab}{" "}
                  Task Report
                </h2>

                <p className="text-blue-100 text-sm mt-1">
                  Generated on{" "}
                  {reportsData?.weekly
                    ?.generated_on ||
                    reportsData?.daily
                      ?.generated_on ||
                    new Date().toLocaleDateString()}
                </p>

              </div>

              <BarChart3
                size={52}
                className="text-blue-300"
              />

            </div>

          </div>

          {/* ------------------------------------------------ */}
          {/* KPI CARDS */}
          {/* ------------------------------------------------ */}

          <div className="grid grid-cols-5 gap-4 mb-8">

            {/* Total */}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-gray-500">
                  Total Tasks
                </p>

                <Activity
                  size={20}
                  className="text-blue-600"
                />

              </div>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalTasks}
              </p>

            </div>

            {/* Completed */}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <CheckCircle
                  size={20}
                  className="text-green-600"
                />

              </div>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {completedTasks}
              </p>

              <p className="text-xs text-green-600 mt-1">
                {completionRate}% completion
              </p>

            </div>

            {/* Pending */}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <Circle
                  size={20}
                  className="text-yellow-600"
                />

              </div>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {pendingTasks}
              </p>

              <p className="text-xs text-yellow-600 mt-1">
                {pendingRate}% of total
              </p>

            </div>

            {/* In Progress */}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-gray-500">
                  In Progress
                </p>

                <Activity
                  size={20}
                  className="text-purple-600"
                />

              </div>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {inProgressTasks}
              </p>

              <p className="text-xs text-purple-600 mt-1">
                {inProgressRate}% active
              </p>

            </div>

            {/* Overdue */}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-gray-500">
                  Overdue
                </p>

                <AlertTriangle
                  size={20}
                  className="text-red-600"
                />

              </div>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {overdueTasks}
              </p>

              <p className="text-xs text-red-600 mt-1">
                {overdueRate}% of total
              </p>

            </div>

          </div>

          {/* ------------------------------------------------ */}
          {/* STATUS DISTRIBUTION */}
          {/* ------------------------------------------------ */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">

            <h2 className="text-lg font-bold text-gray-900">
              Task Status Distribution
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Current task lifecycle status from the backend.
            </p>

            <div className="grid grid-cols-4 gap-6">

              {/* Completed */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-sm font-semibold text-gray-700">
                    Completed
                  </span>

                  <span className="text-sm font-bold text-green-600">
                    {completedTasks}
                  </span>

                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${completionRate}%`,
                    }}
                  />

                </div>

              </div>

              {/* Pending */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-sm font-semibold text-gray-700">
                    Pending
                  </span>

                  <span className="text-sm font-bold text-yellow-600">
                    {pendingTasks}
                  </span>

                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width: `${pendingRate}%`,
                    }}
                  />

                </div>

              </div>

              {/* In Progress */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-sm font-semibold text-gray-700">
                    In Progress
                  </span>

                  <span className="text-sm font-bold text-purple-600">
                    {inProgressTasks}
                  </span>

                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${inProgressRate}%`,
                    }}
                  />

                </div>

              </div>

              {/* Overdue */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-sm font-semibold text-gray-700">
                    Overdue
                  </span>

                  <span className="text-sm font-bold text-red-600">
                    {overdueTasks}
                  </span>

                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${overdueRate}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ------------------------------------------------ */}
          {/* EMPLOYEE PERFORMANCE */}
          {/* ------------------------------------------------ */}

          {activeTab === "Employee Performance" && (

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Employee Performance
              </h2>

              {Array.isArray(individualData) &&
              individualData.length > 0 ? (

                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">

                        <th className="p-3">
                          Employee
                        </th>

                        <th className="p-3">
                          Department
                        </th>

                        <th className="p-3">
                          Completed
                        </th>

                        <th className="p-3">
                          Completion Rate
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {individualData.map(
                        (member: any, index: number) => (

                          <tr
                            key={
                              member.id ||
                              member.user_id ||
                              member.employee ||
                              index
                            }
                            className="border-b hover:bg-gray-50"
                          >

                            <td className="p-3 font-semibold">
                              {member.name ||
                                member.employee ||
                                "Unknown"}
                            </td>

                            <td className="p-3 text-gray-600">
                              {member.department ||
                                "Engineering"}
                            </td>

                            <td className="p-3 font-bold text-blue-600">
                              {member.tasksCompleted ??
                                member.completed ??
                                member.completed_tasks ??
                                0}
                            </td>

                            <td className="p-3 font-bold text-green-600">
                              {member.completion_rate ??
                                member.completionRate ??
                                0}
                              %
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="text-center py-10 text-gray-500">
                  No employee performance data available yet.
                </div>

              )}

            </div>

          )}

        </main>

        {/* ------------------------------------------------ */}
        {/* SCHEDULE MODAL */}
        {/* ------------------------------------------------ */}

        {showScheduleModal && (

          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-lg font-bold text-purple-700">
                  Schedule Recurring Report
                </h2>

                <button
                  onClick={() =>
                    setShowScheduleModal(false)
                  }
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>

              </div>

              {scheduleSuccess ? (

                <div className="py-8 text-center">

                  <CheckCircle2
                    size={45}
                    className="text-green-600 mx-auto mb-3"
                  />

                  <p className="font-bold text-gray-900">
                    Schedule Saved!
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Reports will be sent to{" "}
                    {scheduleEmail}
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  <div>

                    <label className="block text-sm font-semibold mb-1">
                      Recipient Email
                    </label>

                    <input
                      type="email"
                      value={scheduleEmail}
                      onChange={(e) =>
                        setScheduleEmail(
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-2.5"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-semibold mb-1">
                      Frequency
                    </label>

                    <select
                      value={scheduleFrequency}
                      onChange={(e) =>
                        setScheduleFrequency(
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-2.5"
                    >

                      <option value="Daily">
                        Daily
                      </option>

                      <option value="Weekly">
                        Weekly
                      </option>

                      <option value="Monthly">
                        Monthly
                      </option>

                    </select>

                  </div>

                  <div>

                    <label className="block text-sm font-semibold mb-1">
                      Delivery Time
                    </label>

                    <input
                      type="text"
                      value={scheduleTime}
                      onChange={(e) =>
                        setScheduleTime(
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl p-2.5"
                    />

                  </div>

                  <div className="flex justify-end gap-3 pt-3">

                    <button
                      onClick={() =>
                        setShowScheduleModal(false)
                      }
                      className="px-4 py-2 border rounded-xl"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveSchedule}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl"
                    >
                      <Send size={14} />
                      Confirm Schedule
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}

      </div>
    </div>
  );
}