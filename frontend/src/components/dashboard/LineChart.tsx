import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useMemo } from "react";
import { useDashboardSummary } from "../../hooks/useApi";
import { LoadingSpinner, ErrorMessage } from "../common/UIStates";

export default function ProductivityChart() {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useDashboardSummary();

  // ---------------------------------------------------------
  // Build chart data from actual tasks
  // ---------------------------------------------------------

  const chartData = useMemo(() => {
    const tasks = Array.isArray(dashboardData?.tasks)
      ? dashboardData.tasks
      : [];

    // Group completed tasks by month.
    const monthlyData: Record<string, number> = {};

    tasks.forEach((task: any) => {
      if (task.status !== "Completed" || !task.due_date) {
        return;
      }

      const date = new Date(task.due_date);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const month = date.toLocaleString("en-US", {
        month: "short",
      });

      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const result = Object.entries(monthlyData).map(
      ([month, completed]) => ({
        month,
        completed,
      })
    );

    return result;
  }, [dashboardData]);

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-[17px] font-semibold text-[#111827]">
            Productivity Trends
          </h2>

          <p className="text-[13px] text-[#9CA3AF] mt-0.5">
            Completed tasks by month
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[13px] text-[#6B7280]">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] inline-block" />
          Completed Tasks
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="h-[200px] flex items-center justify-center">
          <ErrorMessage
            message={
              error instanceof Error
                ? error.message
                : "Failed to load productivity data"
            }
            retry={refetch}
          />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[200px] flex flex-col items-center justify-center text-center">
          <div className="text-[14px] font-medium text-[#6B7280]">
            No completed tasks yet
          </div>

          <div className="text-[12px] text-[#9CA3AF] mt-1">
            Completed task activity will appear here.
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={chartData}
            margin={{
              top: 4,
              right: 4,
              left: -24,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="blueGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#2563EB"
                  stopOpacity={0.15}
                />

                <stop
                  offset="95%"
                  stopColor="#2563EB"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F3F4F6"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{
                fontSize: 13,
                fill: "#9CA3AF",
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 13,
                fill: "#9CA3AF",
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              cursor={{
                stroke: "#DBEAFE",
                strokeWidth: 1,
              }}
            />

            <Area
              type="monotone"
              dataKey="completed"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#blueGrad)"
              dot={{
                r: 4,
                fill: "#2563EB",
              }}
              activeDot={{
                r: 6,
              }}
              name="Completed"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}