import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAIRecommendations } from "../../hooks/useApi";
import { LoadingSpinner, ErrorMessage } from "../common/UIStates";

export default function AIInsights() {
  const navigate = useNavigate();
  const { data: insights, isLoading, error, refetch } = useAIRecommendations();

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#7C3AED]" />
          <span className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">AI INSIGHTS</span>
        </div>
        <button className="w-6 h-6 rounded-full bg-[#111827] text-white flex items-center justify-center text-[16px] font-bold leading-none hover:bg-[#374151] transition-colors">
          +
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error.message} retry={refetch} />
      ) : (
        <>
          {/* Insight cards */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {(insights || []).slice(0, 2).map((item: any, i: number) => (
              <div key={i} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3.5">
                <p className="text-[14px] font-semibold text-[#111827] mb-1">{item.title}</p>
                <p className="text-[13px] text-[#6B7280] leading-snug">{item.desc || item.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-3 pb-3 mt-auto">
            <button
              onClick={() => navigate("/ai-recommendations")}
              className="w-full border border-[#E5E7EB] text-[13px] font-semibold text-[#374151] py-2.5 rounded-lg hover:bg-[#F9FAFB] transition-colors uppercase tracking-wide"
            >
              Generate Full Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}
