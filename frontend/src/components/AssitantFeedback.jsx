import { Sparkles, Loader2, X } from "lucide-react";

export default function AssistantFeedback({ loading = false, message = null, onDismiss = null }) {
  if (!loading && !message) return null;

  return (
    <div className="bg-[#2a2a2a] rounded-3xl p-6 mb-8">

      <div className="flex items-start gap-4">

        {/* Icon */}
        <div className="bg-blue-500 p-3 rounded-2xl">
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={22} />}
        </div>

        {/* Text */}
        <div className="flex-1">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Assistant</h2>
              <p className="text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">{message}</p>
            </div>
            {onDismiss && (
              <button onClick={onDismiss} className="text-gray-400 hover:text-white">
                <X />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}