import { useEffect, useState } from "react";
import { Search, Bell, HelpCircle, Moon, Sun } from "lucide-react";

export default function Header() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  );

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <header className="h-[56px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 flex-1 max-w-md">
        <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search tasks, projects, or insights..."
          className="bg-transparent outline-none text-[14px] text-[#111827] placeholder:text-[#9CA3AF] w-full"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          type="button"
          className="flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-2 text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="flex items-center gap-1.5 text-[14px] text-[#6B7280] hover:text-[#111827] transition-colors">
          <Bell size={16} />
          <span>Help</span>
        </button>
        <div className="w-px h-5 bg-[#E5E7EB]" />
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="text-right">
            <p className="text-[14px] font-semibold text-[#111827] leading-tight">Alex Rivers</p>
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-widest font-medium">Team Lead</p>
          </div>
          <img
            src="https://i.pravatar.cc/40?img=12"
            className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
            alt="Profile"
          />
        </div>
      </div>
    </header>
  );
}
