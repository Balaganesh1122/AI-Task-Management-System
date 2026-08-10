import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useProductivityStats } from "../../hooks/useApi";
import { LoadingSpinner, ErrorMessage } from "../common/UIStates";

export default function ProductivityChart() {
  const { data: productivityData, isLoading, error, refetch } = useProductivityStats();

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-[17px] font-semibold text-[#111827]">Productivity Trends</h2>
          <p className="text-[13px] text-[#9CA3AF] mt-0.5">Task completion velocity over time</p>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-[#6B7280]">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] inline-block" />
          Completed Tasks
        </div>
      </div>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error.message} retry={refetch} />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={productivityData?.data || []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 13, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              cursor={{ stroke: "#DBEAFE", strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="completed" stroke="#2563EB" strokeWidth={2.5} fill="url(#blueGrad)" dot={false} name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
