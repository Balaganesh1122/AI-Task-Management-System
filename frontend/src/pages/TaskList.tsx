import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import TaskTable from "../components/tasks/TaskTable";

export default function TaskList() {
  const navigate = useNavigate();

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[26px] font-bold text-[#111827]">Task List</h1>
            <p className="text-[15px] text-[#6B7280] mt-1">View, filter, and manage all project tasks.</p>
          </div>
          <button
            onClick={() => navigate("/create-task")}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-[14px] font-semibold transition-colors"
          >
            <Plus size={16} />
            Create Task
          </button>
        </div>

        <TaskTable />
        </main>
      </div>
    </div>
  );
}
