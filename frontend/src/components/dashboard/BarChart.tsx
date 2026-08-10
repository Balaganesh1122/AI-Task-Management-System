import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { weeklyData } from "../../data/dummyData";

export default function WeeklyBarChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
      <div className="mb-5">
        <h2 className="text-[18px] font-semibold text-[#111827]">Weekly Completion</h2>
        <p className="text-sm text-[#6B7280]">Tasks completed this week</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13 }}
            cursor={{ fill: "#F3F4F6" }}
          />
          <Bar dataKey="tasks" fill="#2563EB" radius={[6, 6, 0, 0]} name="Tasks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
