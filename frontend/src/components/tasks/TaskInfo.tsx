export default function TaskInfo() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-4">
        Build AI Dashboard
      </h2>

      <p className="text-gray-600 mb-6">
        Develop the dashboard using React, Tailwind CSS,
        Recharts and shadcn/ui components.
      </p>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <p className="text-gray-500">Assigned To</p>
          <h3 className="font-semibold">Padma Priya</h3>
        </div>

        <div>
          <p className="text-gray-500">Priority</p>
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
            High
          </span>
        </div>

        <div>
          <p className="text-gray-500">Status</p>
          <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
            In Progress
          </span>
        </div>

        <div>
          <p className="text-gray-500">Due Date</p>
          <h3 className="font-semibold">15 Jul 2026</h3>
        </div>

      </div>

    </div>
  );
}