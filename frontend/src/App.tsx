import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import TaskDetails from "./pages/TaskDetails";
import CreateTask from "./pages/CreateTask";
import AssignTask from "./pages/AssignTask";
import OverdueTasks from "./pages/OverdueTasks";
import Reports from "./pages/Reports";
import AIRecommendations from "./pages/AIRecommendations";
import EmailLogs from "./pages/EmailLogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/task-assignment" element={<AssignTask />} />
        <Route path="/overdue-tasks" element={<OverdueTasks />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ai-recommendations" element={<AIRecommendations />} />
        <Route path="/email-logs" element={<EmailLogs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
