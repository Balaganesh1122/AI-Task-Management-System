import type { Task } from "../../types";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-500",
  "In Progress": "bg-blue-500",
  Completed: "bg-green-500",
  Overdue: "bg-red-500",
};

export default function StatusAllocation({ tasks }: { tasks: Task[] }) {
  const allocations = ["Pending", "In Progress", "Completed", "Overdue"].map((label) => ({
    label,
    pct: tasks.length ? Math.round((tasks.filter((task) => task.status === label).length / tasks.length) * 100) : 0,
    color: statusColors[label],
  }));

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col h-full">
      <h2 className="text-[17px] font-semibold text-[#111827] mb-0.5">Status Allocation</h2>
      <p className="text-[13px] text-[#9CA3AF] mb-5">Distribution for the selected tasks</p>
      <div className="space-y-4 flex-1">
        {allocations.map((item) => <div key={item.label}>
          <div className="flex items-center justify-between mb-1.5"><span className="text-[14px] text-[#374151]">{item.label}</span><span className="text-[14px] font-semibold text-[#111827]">{item.pct}%</span></div>
          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${item.color}`} style={{ width: `${item.pct}%` }} /></div>
        </div>)}
      </div>
      <div className="mt-5 flex items-start gap-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3"><span className="text-[16px] flex-shrink-0">✨</span><p className="text-[13px] text-[#374151] leading-snug">Status allocation updates as your task statuses change.</p></div>
    </div>
  );
}
