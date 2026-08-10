import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
  trendLabel?: string;
}

export default function StatsCard({ title, value, icon, iconColor, trend, trendUp, trendLabel }: StatsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[13px] font-semibold px-2 py-0.5 rounded ${
            trendUp ? "text-[#16A34A] bg-[#F0FDF4]" : "text-[#DC2626] bg-[#FEF2F2]"
          }`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
        {trendLabel && !trend && (
          <span className="text-[13px] font-medium text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded">
            {trendLabel}
          </span>
        )}
      </div>
      {/* Label */}
      <p className="text-[14px] text-[#6B7280] mb-1">{title}</p>
      {/* Big number */}
      <p className="text-[38px] font-bold text-[#111827] leading-none tracking-tight">{value}</p>
    </div>
  );
}
