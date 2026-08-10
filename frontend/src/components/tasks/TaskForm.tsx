export default function TaskForm() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8">

      <h2 className="text-2xl font-bold mb-8">
        Create New Task
      </h2>

      <form className="space-y-6">

        <div>
          <label className="block font-medium mb-2">
            Task Title
          </label>

          <input
            type="text"
            placeholder="Enter task title"
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Description
          </label>

          <textarea
            rows={5}
            placeholder="Enter description"
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block font-medium mb-2">
              Priority
            </label>

            <select className="w-full border rounded-xl p-3">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Status
            </label>

            <select className="w-full border rounded-xl p-3">
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block font-medium mb-2">
              Assign To
            </label>

            <input
              type="text"
              placeholder="Employee Name"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Due Date
            </label>

            <input
              type="date"
              className="w-full border rounded-xl p-3"
            />
          </div>

        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700"
        >
          Create Task
        </button>

      </form>

    </div>
  );
}