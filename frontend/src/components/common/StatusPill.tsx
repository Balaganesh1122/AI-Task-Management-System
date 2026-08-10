import type { Status } from "../../data/dummyData";

const styles: Record<Status, string> = {
  Completed: "bg-green-50 text-green-700 border border-green-200",
  "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
  Pending: "bg-amber-50 text-amber-700 border border-amber-200",
  Overdue: "bg-red-50 text-red-700 border border-red-200",
};

const dots: Record<Status, string> = {
  Completed: "bg-green-500",
  "In Progress": "bg-blue-500",
  Pending: "bg-amber-500",
  Overdue: "bg-red-500",
};

export default function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}
