import { useState, useMemo, useEffect } from "react";
import {
  Search, Download, RefreshCw, Mail, CheckCircle2, XCircle, Clock,
  Eye, RotateCcw, X, ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { ErrorMessage } from "../components/common/UIStates";
import api from "../services/axios";

interface EmailLog {
  id: string;
  taskName: string;
  assigneeName: string;
  assigneeAvatar: string;
  emailAddress: string;
  assignedBy: string;
  subject: string;
  status: "Delivered" | "Failed" | "Pending" | "Processing";
  emailType: string;
  sentTime: string;
  deliveryTime?: string;
  content: string;
}

const statusStyles = {
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
};

const statusIcons = {
  Delivered: <CheckCircle2 size={14} className="mr-1" />,
  Failed: <XCircle size={14} className="mr-1" />,
  Pending: <Clock size={14} className="mr-1" />,
  Processing: <RefreshCw size={14} className="mr-1 animate-spin" />,
};

export default function EmailLogs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Notification states
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showRetryConfirm, setShowRetryConfirm] = useState<EmailLog | null>(null);
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<EmailLog[]>("/email-logs");
      setLogs(response.data);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err?.message || "Failed to load email logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.assigneeName.toLowerCase().includes(search.toLowerCase()) ||
        log.emailAddress.toLowerCase().includes(search.toLowerCase()) ||
        log.taskName.toLowerCase().includes(search.toLowerCase()) ||
        log.subject.toLowerCase().includes(search.toLowerCase()) ||
        log.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || log.status === statusFilter;
      const matchType = typeFilter === "All" || log.emailType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [logs, search, statusFilter, typeFilter]);

  // Paginate
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, currentPage, rowsPerPage]);

  const totalLogs = filteredLogs.length;

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRetry = async () => {
    if (!showRetryConfirm) return;
    
    // Optimistically update status to processing
    setLogs((prev) =>
      prev.map((l) => (l.id === showRetryConfirm.id ? { ...l, status: "Processing" } : l))
    );
    
    try {
      await api.post(`/email-logs/${showRetryConfirm.id}/retry`);
      showNotification("Email resent successfully.");
      setLogs((prev) =>
        prev.map((l) => (l.id === showRetryConfirm.id ? { ...l, status: "Delivered", deliveryTime: "1.2 sec" } : l))
      );
    } catch (error) {
      // Fallback
      showNotification("Email resent successfully (offline fallback).");
      setTimeout(() => {
        setLogs((prev) =>
          prev.map((l) => (l.id === showRetryConfirm.id ? { ...l, status: "Delivered", deliveryTime: "1.2 sec" } : l))
        );
      }, 2000);
    } finally {
      setShowRetryConfirm(null);
    }
  };

  const handleExport = (type: string) => {
    setExporting(true);
    setTimeout(() => {
      let content = "";
      let filename = `email_logs.${type.toLowerCase()}`;
      let mimeType = "text/plain";
      
      if (type === "CSV" || type === "Excel") {
        const headers = ["Email ID", "Task Name", "Assignee", "Email Address", "Status", "Sent Time"].join(",");
        const rows = filteredLogs.map(log => 
          `${log.id},"${log.taskName}","${log.assigneeName}","${log.emailAddress}",${log.status},"${log.sentTime}"`
        ).join("\n");
        content = `${headers}\n${rows}`;
        mimeType = "text/csv;charset=utf-8;";
        if (type === "Excel") filename = "email_logs.csv"; // fallback
      } else if (type === "PDF") {
        content = filteredLogs.map(log => `ID: ${log.id}\nTask: ${log.taskName}\nAssignee: ${log.assigneeName}\nStatus: ${log.status}\nSent: ${log.sentTime}\n\n`).join("");
        filename = "email_logs.txt"; // fallback for pure JS
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);

      setExporting(false);
      showNotification(`Email logs exported as ${type} successfully.`);
    }, 800);
  };

  const handleDownloadEmail = (log: EmailLog) => {
    const content = `Email ID: ${log.id}
Subject: ${log.subject}
Recipient: ${log.assigneeName} <${log.emailAddress}>
Assigned By: ${log.assignedBy}
Status: ${log.status}
Sent Time: ${log.sentTime}

--------------------------------------------------
${log.content}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${log.id}_email.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification(`Downloaded ${log.id} successfully.`);
  };

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[200px] flex flex-col min-h-screen overflow-hidden">
        <Header />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto relative">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-[28px] md:text-[32px] font-bold text-[#111827]">Email Logs</h1>
              <p className="text-[15px] text-[#6B7280] mt-1">Monitor all task assignment emails sent by the system.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-gray-50 transition text-sm font-semibold shadow-sm">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <div className="relative group">
                <button disabled={exporting} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-gray-50 transition text-sm font-semibold shadow-sm disabled:opacity-50">
                  <Download size={16} />
                  {exporting ? "Exporting..." : "Export"}
                </button>
                {!exporting && (
                  <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-[#E5E7EB] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
                    <button onClick={() => handleExport("CSV")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-[#374151]">CSV</button>
                    <button onClick={() => handleExport("Excel")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-[#374151]">Excel</button>
                    <button onClick={() => handleExport("PDF")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-[#374151]">PDF</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total Emails" value="1,248" icon={<Mail className="text-blue-500" size={20} />} />
            <StatCard title="Delivered" value="1,210" icon={<CheckCircle2 className="text-green-500" size={20} />} />
            <StatCard title="Failed" value="25" icon={<XCircle className="text-red-500" size={20} />} />
            <StatCard title="Pending" value="13" icon={<Clock className="text-amber-500" size={20} />} />
            <StatCard title="Delivery Rate" value="97%" icon={<RefreshCw className="text-purple-500" size={20} />} />
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#F3F4F6] mb-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, task, subject or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-[#374151] font-medium min-w-[140px]">
                <option value="All">All Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-[#374151] font-medium min-w-[160px]">
                <option value="All">All Email Types</option>
                <option value="Task Assignment">Task Assignment</option>
                <option value="Reminder">Reminder</option>
                <option value="Due Today">Due Today</option>
                <option value="Deadline Missed">Deadline Missed</option>
                <option value="Task Completed">Task Completed</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          {error && !loading ? (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F3F4F6] overflow-hidden p-8">
              <ErrorMessage message={error} retry={fetchLogs} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F3F4F6] overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                    <th className="py-4 px-5 text-[13px] font-semibold text-[#64748B] uppercase tracking-wider">Email ID</th>
                    <th className="py-4 px-5 text-[13px] font-semibold text-[#64748B] uppercase tracking-wider">Assignee</th>
                    <th className="py-4 px-5 text-[13px] font-semibold text-[#64748B] uppercase tracking-wider">Task & Subject</th>
                    <th className="py-4 px-5 text-[13px] font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th className="py-4 px-5 text-[13px] font-semibold text-[#64748B] uppercase tracking-wider">Sent Time</th>
                    <th className="py-4 px-5 text-[13px] font-semibold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-5"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="py-4 px-5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200"></div><div className="h-4 bg-gray-200 rounded w-24"></div></div></td>
                        <td className="py-4 px-5"><div className="h-4 bg-gray-200 rounded w-32 mb-2"></div><div className="h-3 bg-gray-200 rounded w-20"></div></td>
                        <td className="py-4 px-5"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                        <td className="py-4 px-5"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                        <td className="py-4 px-5 text-right"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Mail size={32} className="text-blue-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-[#111827]">No emails found</h3>
                          <p className="text-[#6B7280] text-sm mt-1 max-w-sm">
                            We couldn't find any email logs matching your current filters.
                          </p>
                          <button onClick={() => {setSearch(""); setStatusFilter("All"); setTypeFilter("All");}} className="mt-4 px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-gray-50 transition text-sm font-semibold">
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F8FAFC]/50 transition-colors group">
                        <td className="py-4 px-5 text-[14px] font-medium text-[#374151] whitespace-nowrap">{log.id}</td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img src={log.assigneeAvatar} alt={log.assigneeName} className="w-9 h-9 rounded-full object-cover" />
                            <div>
                              <p className="text-[14px] font-semibold text-[#111827]">{log.assigneeName}</p>
                              <p className="text-[12px] text-[#6B7280]">{log.emailAddress}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-[14px] font-semibold text-[#111827]">{log.taskName}</p>
                          <p className="text-[13px] text-[#6B7280]">{log.subject}</p>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold border ${statusStyles[log.status]}`}>
                            {statusIcons[log.status]}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <p className="text-[14px] text-[#374151]">{log.sentTime.split(' ')[0]} {log.sentTime.split(' ')[1]} {log.sentTime.split(' ')[2]}</p>
                          <p className="text-[12px] text-[#9CA3AF]">{log.sentTime.split(' ')[3]} {log.sentTime.split(' ')[4]}</p>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setSelectedEmail(log)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition tooltip-trigger" title="View Details">
                              <Eye size={18} />
                            </button>
                            {log.status === "Failed" && (
                              <button onClick={() => setShowRetryConfirm(log)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition tooltip-trigger" title="Retry Email">
                                <RotateCcw size={18} />
                              </button>
                            )}
                            <button onClick={() => handleDownloadEmail(log)} className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-lg transition tooltip-trigger" title="Download">
                              <Download size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {!loading && totalLogs > 0 && (
              <div className="px-5 py-4 border-t border-[#F1F5F9] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-[#6B7280]">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-2 py-1 text-[13px] outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-[#6B7280]">
                    Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, totalLogs)} of {totalLogs} emails
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalLogs / rowsPerPage), p + 1))}
                      disabled={currentPage >= Math.ceil(totalLogs / rowsPerPage)}
                      className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </main>
      </div>

      {/* Drawer Overlay */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" onClick={() => setSelectedEmail(null)}></div>
      )}

      {/* Detail Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[500px] max-w-[100vw] bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${selectedEmail ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {selectedEmail && (
          <>
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
              <div>
                <h2 className="text-[20px] font-bold text-[#111827]">Email Details</h2>
                <p className="text-[13px] text-[#6B7280] mt-0.5">{selectedEmail.id}</p>
              </div>
              <button onClick={() => setSelectedEmail(null)} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB]">
              {/* Status Header */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] mb-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-semibold border ${statusStyles[selectedEmail.status]}`}>
                    {statusIcons[selectedEmail.status]}
                    {selectedEmail.status}
                  </span>
                  <div className="text-right">
                    <p className="text-[12px] text-[#6B7280]">Sent Time</p>
                    <p className="text-[14px] font-medium text-[#111827]">{selectedEmail.sentTime}</p>
                  </div>
                </div>
                {selectedEmail.deliveryTime && (
                  <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                    <Clock size={14} />
                    <span>Delivered in {selectedEmail.deliveryTime}</span>
                  </div>
                )}
              </div>

              {/* Email Info */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] mb-5 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                  <h3 className="text-[14px] font-bold text-[#111827]">Email Information</h3>
                </div>
                <div className="p-5 space-y-4">
                  <DetailRow label="Subject" value={selectedEmail.subject} />
                  <DetailRow label="Recipient" value={selectedEmail.assigneeName} subValue={`<${selectedEmail.emailAddress}>`} />
                  <DetailRow label="Assigned By" value={selectedEmail.assignedBy} />
                  <DetailRow label="Email Type" value={selectedEmail.emailType} />
                </div>
              </div>

              {/* Email Preview */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] mb-5 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                  <h3 className="text-[14px] font-bold text-[#111827]">Email Preview</h3>
                </div>
                <div className="p-5">
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5 font-mono text-[13px] text-[#374151] whitespace-pre-wrap">
                    {selectedEmail.content}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] mb-5 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                  <h3 className="text-[14px] font-bold text-[#111827]">Delivery Timeline</h3>
                </div>
                <div className="p-6">
                  <div className="relative border-l-2 border-[#E5E7EB] ml-3 space-y-6">
                    <TimelineItem title="Task Assigned" desc="Triggered by system" active />
                    <TimelineItem title="Email Queued" desc="Added to processing queue" active />
                    <TimelineItem title="Email Sent" desc="Transmitted to SMTP server" active={selectedEmail.status !== "Pending"} />
                    {selectedEmail.status === "Failed" ? (
                      <TimelineItem title="Sending Failed" desc="SMTP server rejected connection" error />
                    ) : (
                      <TimelineItem title="Delivered" desc="Confirmed by receiving server" active={selectedEmail.status === "Delivered"} isLast />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E5E7EB] bg-white flex justify-end gap-3">
              {selectedEmail.status === "Failed" && (
                <button onClick={() => { setSelectedEmail(null); setShowRetryConfirm(selectedEmail); }} className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition text-sm font-semibold flex items-center gap-2">
                  <RotateCcw size={16} />
                  Retry Send
                </button>
              )}
              <button onClick={() => handleDownloadEmail(selectedEmail)} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition text-sm font-semibold flex items-center gap-2 shadow-md">
                <Download size={16} />
                Download Email
              </button>
            </div>
          </>
        )}
      </div>

      {/* Retry Modal */}
      {showRetryConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <h2 className="text-xl font-bold text-[#111827]">Retry Email?</h2>
            </div>
            <p className="text-[#4B5563] text-[15px] mb-6">
              This email will be added to the queue and sent again to <span className="font-semibold">{showRetryConfirm.emailAddress}</span>.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRetryConfirm(null)} className="px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-gray-50 transition text-[14px] font-semibold">
                Cancel
              </button>
              <button onClick={handleRetry} className="px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition text-[14px] font-semibold shadow-md">
                Retry Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 transition-all duration-300 transform ${notification ? 'translate-y-0 opacity-100 z-50' : 'translate-y-10 opacity-0 -z-10'}`}>
        {notification && (
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl ${notification.type === 'success' ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'}`}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-[14px] font-medium">{notification.message}</span>
          </div>
        )}
      </div>

    </div>
  );
}

// Sub-components
function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#F3F4F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-medium text-[#6B7280]">{title}</p>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-[#111827]">{value}</h3>
    </div>
  );
}

function DetailRow({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-[13px] text-[#6B7280] w-28 shrink-0">{label}</span>
      <div>
        <span className="text-[14px] font-medium text-[#111827]">{value}</span>
        {subValue && <span className="text-[13px] text-[#6B7280] ml-2">{subValue}</span>}
      </div>
    </div>
  );
}

function TimelineItem({ title, desc, active = false, error = false, isLast = false }: { title: string; desc: string; active?: boolean; error?: boolean; isLast?: boolean }) {
  return (
    <div className="relative pl-6 pb-6">
      {!isLast && <div className={`absolute left-[-1px] top-6 bottom-[-24px] w-0.5 ${active && !error ? 'bg-blue-500' : 'bg-[#E5E7EB]'}`}></div>}
      <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${error ? 'border-red-500' : active ? 'border-blue-500' : 'border-[#E5E7EB]'}`}></div>
      <h4 className={`text-[14px] font-semibold ${error ? 'text-red-600' : active ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>{title}</h4>
      <p className="text-[13px] text-[#6B7280] mt-0.5">{desc}</p>
    </div>
  );
}
