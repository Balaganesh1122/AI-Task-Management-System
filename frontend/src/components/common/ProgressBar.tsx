interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  height?: string;
  color?: string;
  isLoading?: boolean;
  isOverdue?: boolean;
}

export default function ProgressBar({
  value,
  showLabel = false,
  height = "h-1.5",
  color,
  isLoading = false,
  isOverdue = false,
}: ProgressBarProps) {
  const barColor = color ?? (isOverdue ? "bg-red-500" : value === 100 ? "bg-green-500" : value >= 60 ? "bg-blue-500" : value >= 30 ? "bg-amber-500" : "bg-red-400");

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-100 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ${barColor} ${isLoading ? "animate-pulse" : ""}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-[#6B7280] w-8 text-right">{value}%</span>}
    </div>
  );
}
