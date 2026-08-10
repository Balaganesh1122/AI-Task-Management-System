import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, PlusCircle, UserCheck,
  AlertTriangle, BarChart3, Sparkles, Settings, LogOut, Plus, Mail
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Task List", icon: ClipboardList, to: "/tasks" },
  { label: "Create Task", icon: PlusCircle, to: "/create-task" },
  { label: "Task Assignment", icon: UserCheck, to: "/task-assignment" },
  { label: "Overdue Panel", icon: AlertTriangle, to: "/overdue-tasks" },
  { label: "Reports", icon: BarChart3, to: "/reports" },
  { label: "AI Recommendations", icon: Sparkles, to: "/ai-recommendations" },
  { label: "Email Logs", icon: Mail, to: "/email-logs" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="w-[200px] h-screen bg-[#111827] fixed left-0 top-0 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <p className="text-[18px] font-bold text-white leading-tight">TaskAI Pro</p>
        <p className="text-[13px] text-white/40 mt-0.5">Intelligent Workflow</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150 ${
                isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#2563EB] rounded-r-full" />
                )}
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-[rgba(37,99,235,0.15)]" />
                )}
                <Icon size={16} className={`relative z-10 flex-shrink-0 ${isActive ? "text-[#60A5FA]" : "text-white/40"}`} />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* New Project button */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={() => navigate("/create-task")}
          className="flex items-center justify-center gap-2 w-full bg-white text-[#111827] text-[14px] font-semibold py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Logout */}
      <div className="px-2 py-2 border-t border-white/10">
        <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-medium text-white/40 hover:bg-red-500/15 hover:text-red-400 transition-all w-full">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
