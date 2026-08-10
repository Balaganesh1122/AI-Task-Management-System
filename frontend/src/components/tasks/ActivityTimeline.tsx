const activities = [
  "Task Created",
  "Assigned to Padma Priya",
  "Status changed to In Progress",
  "Comment Added",
];

export default function ActivityTimeline() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-6">
        Activity Timeline
      </h2>

      <ul className="space-y-4">

        {activities.map((activity) => (

          <li
            key={activity}
            className="border-l-4 border-blue-500 pl-4"
          >
            {activity}
          </li>

        ))}

      </ul>

    </div>
  );
}