import type { Priority } from "../../data/dummyData";

const styles: Record<Priority, string> = {
  High: "bg-red-50 text-red-600 border border-red-200",
  Medium: "bg-amber-50 text-amber-600 border border-amber-200",
  Low: "bg-green-50 text-green-600 border border-green-200",
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${styles[priority]}`}>
      {priority}
    </span>
  );
}
