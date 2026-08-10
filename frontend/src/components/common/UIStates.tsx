import { Loader2, AlertCircle, Inbox } from "lucide-react";

export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-[#6B7280]">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ErrorMessage({ message = "An error occurred. Please try again.", retry }: { message?: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-red-600 bg-red-50 rounded-xl border border-red-100">
      <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
      <p className="text-[15px] font-semibold text-center mb-1">Failed to load data</p>
      <p className="text-sm text-red-500 text-center mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = "No data available", message = "There is nothing to display here right now.", icon }: { title?: string; message?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#6B7280] bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
        {icon || <Inbox size={32} />}
      </div>
      <p className="text-lg font-bold text-gray-900 mb-2">{title}</p>
      <p className="text-sm text-center max-w-sm">{message}</p>
    </div>
  );
}
