import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Save,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

interface SettingsData {
  name: string;
  email: string;
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  name: "Ganesh Test",
  email: "ganesh.test@example.com",
  notifications: true,
  emailAlerts: true,
  darkMode: false,
};

export default function Settings() {
  const [name, setName] = useState(DEFAULT_SETTINGS.name);
  const [email, setEmail] = useState(DEFAULT_SETTINGS.email);
  const [notifications, setNotifications] = useState(DEFAULT_SETTINGS.notifications);
  const [emailAlerts, setEmailAlerts] = useState(DEFAULT_SETTINGS.emailAlerts);
  const [darkMode, setDarkMode] = useState(DEFAULT_SETTINGS.darkMode);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("taskai_settings");

      if (!stored) return;

      const parsed = JSON.parse(stored) as Partial<SettingsData>;

      setName(parsed.name ?? DEFAULT_SETTINGS.name);
      setEmail(parsed.email ?? DEFAULT_SETTINGS.email);
      setNotifications(parsed.notifications ?? DEFAULT_SETTINGS.notifications);
      setEmailAlerts(parsed.emailAlerts ?? DEFAULT_SETTINGS.emailAlerts);
      setDarkMode(parsed.darkMode ?? DEFAULT_SETTINGS.darkMode);
    } catch (error) {
      console.error("Failed to load saved settings:", error);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleSave = () => {
    const settings: SettingsData = {
      name,
      email,
      notifications,
      emailAlerts,
      darkMode,
    };

    localStorage.setItem("taskai_settings", JSON.stringify(settings));

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <SettingsIcon size={20} className="text-blue-600" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your TaskAI Pro preferences and account settings.
                  </p>
                </div>
              </div>
            </div>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Profile</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Update your basic account information.
                </p>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Notifications</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Control task and workflow notifications.
                </p>
              </div>

              <div className="p-5 space-y-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Task Notifications</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Receive notifications when tasks are updated.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Email Alerts</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Receive automated task and assignment emails.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Appearance</h2>
                </div>
              </div>

              <div className="p-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Dark Mode</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable dark appearance for the dashboard.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Security</h2>
                </div>
              </div>

              <div className="p-5">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800">Authentication</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your account is protected using JWT-based authentication.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-end gap-3 pb-6">
              {saved && (
                <span className="text-sm font-medium text-green-600">
                  Settings saved successfully.
                </span>
              )}

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}