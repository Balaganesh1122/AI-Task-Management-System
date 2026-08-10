import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { statusDistribution } from "../../data/dummyData";

export default function DonutChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
      <div className="mb-5">
        <h2 className="text-[18px] font-semibold text-[#111827]">Status Distribution</h2>
        <p className="text-sm text-[#6B7280]">Current task breakdown</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={statusDistribution}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {statusDistribution.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
