import { useState } from "react";
import { Sparkles, Wand2, Plus, Check, Pencil, Trash2, Save, X, Download, Upload } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import type { Priority, Status } from "../types";
import { useCreateTask, useCreateTaskFromText } from "../hooks/useApi";
import { parseTaskSpreadsheet, type ImportedTask } from "../utils/taskImport";

interface AITask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  estimatedHours: number;
  confirmed?: boolean;
  editing?: boolean;
}

const PRIORITY_COLOR: Record<Priority, string> = {
  High:   "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low:    "bg-green-50 text-green-700 border-green-200",
};

export default function CreateTask() {
  const [manualTask, setManualTask] = useState({ title: "", description: "", priority: "Medium" as Priority, status: "Pending" as Status, assignee: "Padma Priya", dueDate: "", estimatedHours: "" });
  const [manualMessage, setManualMessage] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiCards, setAiCards] = useState<AITask[]>([]);
  const [error, setError] = useState("");
  const [uploadedTasks, setUploadedTasks] = useState<ImportedTask[]>([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  
  const createTaskMutation = useCreateTask();
  const createTaskFromTextMutation = useCreateTaskFromText();

  async function generateTasks() {
    if (!aiText.trim()) return;
    setError("");
    setAiCards([]);
    try {
      const res = await createTaskFromTextMutation.mutateAsync(aiText);
      setAiCards(res.data.map((t: any) => ({ ...t, id: t.id ?? `ai-${Date.now()}-${Math.random()}` })));
    } catch (err: any) {
      setError(err?.message || "Unable to generate tasks from AI. Please try again.");
    }
  }

  function confirmCard(id: string) {
    setAiCards((prev) => prev.map((c) => c.id === id ? { ...c, confirmed: true, editing: false } : c));
  }

  function discardCard(id: string) {
    setAiCards((prev) => prev.filter((c) => c.id !== id));
  }

  function startEditCard(id: string) {
    setAiCards((prev) => prev.map((c) => c.id === id ? { ...c, editing: true, confirmed: false } : c));
  }

  function saveCardEdit(id: string, patch: Partial<AITask>) {
    setAiCards((prev) => prev.map((c) => c.id === id ? { ...c, ...patch, editing: false } : c));
  }

  async function saveAllConfirmed() {
    const confirmed = aiCards.filter((c) => c.confirmed);
    if (confirmed.length === 0) return;

    for (const card of confirmed) {
      try {
        await createTaskMutation.mutateAsync({
          title: card.title,
          description: card.description,
          priority: card.priority,
          status: card.status,
          assignee: "Unassigned",
          assigneeAvatar: "https://i.pravatar.cc/40?img=1",
          department: "General",
          createdDate: new Date().toISOString().split("T")[0],
          dueDate: "",
          progress: 0,
          estimatedHours: card.estimatedHours || 0,
          tags: [],
        });
      } catch {
        // silently fail or accumulate errors
      }
    }

    setAiCards((prev) => prev.filter((c) => !c.confirmed));
    setManualMessage(`${confirmed.length} AI-generated task${confirmed.length > 1 ? "s" : ""} saved successfully.`);
  }

  const confirmedCount = aiCards.filter((c) => c.confirmed).length;
  const pendingCount = aiCards.filter((c) => !c.confirmed).length;

  async function createManualTask(e: React.FormEvent) {
    e.preventDefault();
    if (!manualTask.title.trim()) { setManualMessage("Add a task title before creating it."); return; }
    
    const payload = {
      title: manualTask.title,
      description: manualTask.description,
      priority: manualTask.priority,
      status: manualTask.status,
      assignee: manualTask.assignee,
      assigneeAvatar: "https://i.pravatar.cc/40?img=1",
      department: "General",
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: manualTask.dueDate || "",
      progress: 0,
      estimatedHours: Number(manualTask.estimatedHours) || 0,
      tags: [],
    };
    
    try { 
      await createTaskMutation.mutateAsync(payload); 
      setManualMessage("Task created successfully.");
      setManualTask({ title: "", description: "", priority: "Medium", status: "Pending", assignee: "Padma Priya", dueDate: "", estimatedHours: "" });
    } catch { 
      setManualMessage("Error creating task.");
    }
  }

  async function handleUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError("");
    setUploadMessage("");
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['csv', 'xlsx', 'xls'].includes(extension)) {
      setUploadError('Only CSV and Excel files are supported.');
      setUploadedTasks([]);
      return;
    }

    try {
      const tasks = await parseTaskSpreadsheet(file);
      if (!tasks.length) {
        setUploadError('No valid tasks found in the uploaded file. Make sure the file contains a Title column.');
        setUploadedTasks([]);
        return;
      }
      setUploadedTasks(tasks);
      setUploadMessage(`${tasks.length} task${tasks.length !== 1 ? 's' : ''} imported from file.`);
    } catch (error) {
      setUploadError('Unable to parse the uploaded file. Please check the format and try again.');
      setUploadedTasks([]);
    }
  }

  function removeUploadedTask(id: string) {
    setUploadedTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function clearUploadedTasks() {
    setUploadedTasks([]);
    setUploadMessage("");
    setUploadError("");
  }

  async function saveUploadedTasks() {
    if (!uploadedTasks.length) return;

    const results = await Promise.allSettled(
      uploadedTasks.map((task) => createTaskMutation.mutateAsync({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee || "Unassigned",
        assigneeAvatar: "https://i.pravatar.cc/40?img=1",
        department: task.department || "General",
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: task.dueDate || "",
        progress: 0,
        estimatedHours: task.estimatedHours || 0,
        tags: task.tags,
      }))
    );

    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    const failureCount = results.length - successCount;

    if (successCount) {
      setManualMessage(`${successCount} imported task${successCount !== 1 ? 's' : ''} created successfully.`);
      setUploadedTasks([]);
      setUploadMessage("");
    }

    if (failureCount) {
      setUploadError(`${failureCount} task${failureCount !== 1 ? 's' : ''} failed to save. Please retry or fix the file.`);
    }
  }

  function downloadExtract() {
    if (!aiCards || aiCards.length === 0) return;
    const dataStr = JSON.stringify(aiCards, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted-tasks-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">

          <div className="mb-5">
            <h1 className="text-[24px] font-bold text-[#111827]">Create Task</h1>
            <p className="text-[14px] text-[#6B7280] mt-1">Create tasks manually or let AI generate them from a description.</p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* ── Manual Form + Upload ── */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Manual Task</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Upload CSV / Excel</label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleUploadChange}
                    className="w-full text-[14px] text-[#374151] file:border file:border-[#E5E7EB] file:rounded-lg file:px-3 file:py-2.5 file:bg-white file:text-[#374151] file:cursor-pointer"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={saveUploadedTasks}
                    disabled={!uploadedTasks.length || createTaskMutation.isPending}
                    className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                  >
                    <Upload size={14} /> Save imported tasks
                  </button>
                  <button
                    type="button"
                    onClick={clearUploadedTasks}
                    disabled={!uploadedTasks.length}
                    className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-4 py-2 text-[13px] font-semibold text-[#374151] hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Clear imported tasks
                  </button>
                </div>
                {uploadMessage && <p className="text-[13px] text-green-600">{uploadMessage}</p>}
                {uploadError && <p className="text-[13px] text-red-600">{uploadError}</p>}
                {uploadedTasks.length > 0 && (
                  <div className="border border-[#E5E7EB] rounded-xl p-3 bg-[#F9FAFB]">
                    <p className="text-[13px] font-semibold text-[#374151] mb-3">Imported Tasks Preview</p>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {uploadedTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3">
                          <div>
                            <p className="text-[14px] font-semibold text-[#111827] truncate">{task.title}</p>
                            <p className="text-[12px] text-[#6B7280]">{task.assignee || 'Unassigned'} · {task.priority} · {task.status}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUploadedTask(task.id)}
                            className="text-[12px] text-[#DC2626] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <form className="space-y-4" onSubmit={createManualTask}>
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Task Title</label>
                  <input type="text" value={manualTask.title} onChange={(e) => setManualTask({ ...manualTask, title: e.target.value })} placeholder="e.g. Build user authentication module"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#9CA3AF]" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Description</label>
                  <textarea rows={3} value={manualTask.description} onChange={(e) => setManualTask({ ...manualTask, description: e.target.value })} placeholder="Describe the task…"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-[#9CA3AF]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Priority</label>
                    <select value={manualTask.priority} onChange={(e) => setManualTask({ ...manualTask, priority: e.target.value as Priority })} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 bg-white text-[#374151]">
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Status</label>
                    <select value={manualTask.status} onChange={(e) => setManualTask({ ...manualTask, status: e.target.value as Status })} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 bg-white text-[#374151]">
                      <option>Pending</option><option>In Progress</option><option>Completed</option><option>Overdue</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Assign To</label>
                    <select value={manualTask.assignee} onChange={(e) => setManualTask({ ...manualTask, assignee: e.target.value })} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 bg-white text-[#374151]">
                      <option>Padma Priya</option><option>Rahul Sharma</option><option>Ganesh Kumar</option>
                      <option>Darshan Patel</option><option>Priya Nair</option><option>Arjun Mehta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Due Date</label>
                    <input type="date" value={manualTask.dueDate} onChange={(e) => setManualTask({ ...manualTask, dueDate: e.target.value })} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 text-[#374151]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Estimated Hours</label>
                  <input type="number" min="0" value={manualTask.estimatedHours} onChange={(e) => setManualTask({ ...manualTask, estimatedHours: e.target.value })} placeholder="e.g. 8"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#9CA3AF]" />
                </div>
                <button type="submit" disabled={createTaskMutation.isPending} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors w-full justify-center">
                  <Plus size={15} /> {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </button>
              {manualMessage && <p className={`text-center text-[13px] font-medium ${manualMessage.startsWith("Add") || manualMessage.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{manualMessage}</p>}
              </form>
            </div>

            {/* ── AI Panel ── */}
            <div className="space-y-4">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles size={14} className="text-[#7C3AED]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-[#111827]">AI Task Generator</h2>
                </div>
                <p className="text-[13px] text-[#6B7280] mb-4">
                  Paste a project description and AI will extract actionable tasks automatically.
                </p>
                <textarea
                  rows={7}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Paste your text here… e.g. 'Build a user authentication system with login, registration, password reset, and JWT token management.'"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-purple-500 resize-none placeholder:text-[#9CA3AF]"
                />
                {error && <p className="text-[13px] text-red-600 mt-2">{error}</p>}
                <button
                  onClick={generateTasks}
                  disabled={!aiText.trim() || createTaskFromTextMutation.isPending}
                  className="mt-3 flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors w-full justify-center"
                >
                  <Wand2 size={15} />
                  {createTaskFromTextMutation.isPending ? "Generating…" : "Extract Tasks with AI"}
                </button>
              </div>

              {/* ── Preview Area ── */}
              <div className={`bg-white border-2 rounded-xl overflow-hidden ${aiCards.length ? "border-[#E5E7EB]" : "border-dashed border-[#E5E7EB]"}`}>
                {aiCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                      <Sparkles size={20} className="text-purple-300" />
                    </div>
                    <p className="text-[14px] font-semibold text-[#374151]">No AI-generated tasks yet.</p>
                    <p className="text-[13px] text-[#9CA3AF] mt-1">Paste your description above and click Generate.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <p className="text-[13px] font-semibold text-[#374151]">
                        {aiCards.length} task{aiCards.length !== 1 ? "s" : ""} extracted
                        {confirmedCount > 0 && <span className="text-green-600 ml-2">· {confirmedCount} confirmed</span>}
                        {pendingCount > 0 && <span className="text-[#6B7280] ml-2">· {pendingCount} pending</span>}
                      </p>
                      <div className="flex items-center gap-2">
                        {aiCards.length > 0 && (
                          <button onClick={downloadExtract} className="flex items-center gap-1.5 border border-[#E5E7EB] bg-white text-[#374151] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download size={12} /> Download
                          </button>
                        )}
                        {confirmedCount > 0 && (
                          <button
                            onClick={saveAllConfirmed}
                            disabled={createTaskMutation.isPending}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Save size={12} /> {createTaskMutation.isPending ? "Saving..." : `Save ${confirmedCount} to list`}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto">
                      {aiCards.map((card) => (
                        <AIPreviewCard
                          key={card.id}
                          card={card}
                          onConfirm={() => confirmCard(card.id)}
                          onDiscard={() => discardCard(card.id)}
                          onEdit={() => startEditCard(card.id)}
                          onSaveEdit={(patch) => saveCardEdit(card.id, patch)}
                          onCancelEdit={() => setAiCards((prev) => prev.map((c) => c.id === card.id ? { ...c, editing: false } : c))}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Individual AI Preview Card ── */
function AIPreviewCard({
  card, onConfirm, onDiscard, onEdit, onSaveEdit, onCancelEdit,
}: {
  card: AITask;
  onConfirm: () => void;
  onDiscard: () => void;
  onEdit: () => void;
  onSaveEdit: (patch: Partial<AITask>) => void;
  onCancelEdit: () => void;
}) {
  const [draft, setDraft] = useState({ ...card });

  const PRIORITY_COLOR: Record<Priority, string> = {
    High:   "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low:    "bg-green-50 text-green-700 border-green-200",
  };

  if (card.editing) {
    return (
      <div className="border-2 border-[#7C3AED] rounded-xl p-3.5 bg-purple-50/30">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full text-[14px] font-semibold border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-purple-500 mb-2"
        />
        <textarea
          rows={2}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="w-full text-[13px] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2"
        />
        <div className="flex gap-2 mb-3">
          <select
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
            className="text-[13px] border border-[#E5E7EB] rounded-lg px-2 py-1.5 outline-none bg-white"
          >
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
          <input
            type="number"
            value={draft.estimatedHours}
            onChange={(e) => setDraft({ ...draft, estimatedHours: Number(e.target.value) })}
            className="text-[13px] border border-[#E5E7EB] rounded-lg px-2 py-1.5 outline-none w-20"
            placeholder="Hours"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSaveEdit(draft)} className="flex items-center gap-1.5 bg-[#7C3AED] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#6D28D9] transition-colors">
            <Save size={12} /> Save
          </button>
          <button onClick={onCancelEdit} className="flex items-center gap-1.5 border border-[#E5E7EB] text-[#6B7280] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-xl p-3.5 transition-all ${card.confirmed ? "border-green-300 bg-green-50/40" : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[14px] font-semibold text-[#111827] leading-tight flex-1">{card.title}</p>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${PRIORITY_COLOR[card.priority]}`}>
          {card.priority}
        </span>
      </div>
      <p className="text-[13px] text-[#6B7280] mb-2.5 line-clamp-2">{card.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#9CA3AF]">~{card.estimatedHours}h estimated</span>
        {card.confirmed ? (
          <span className="flex items-center gap-1 text-[12px] font-semibold text-green-700">
            <Check size={12} /> Confirmed
          </span>
        ) : (
          <div className="flex gap-1.5">
            <button onClick={onConfirm} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors">
              <Check size={11} /> Confirm
            </button>
            <button onClick={onEdit} className="flex items-center gap-1 border border-[#E5E7EB] text-[#374151] text-[12px] font-semibold px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors">
              <Pencil size={11} /> Edit
            </button>
            <button onClick={onDiscard} className="flex items-center gap-1 border border-red-200 text-red-600 text-[12px] font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={11} /> Discard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
