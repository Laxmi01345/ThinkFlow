import { Sparkles } from "lucide-react";

export default function AssistantFeedback() {
  return (
    <div className="bg-[#2a2a2a] rounded-3xl p-6 mb-8">

      <div className="flex items-start gap-4">

        {/* Icon */}
        <div className="bg-blue-500 p-3 rounded-2xl">
          <Sparkles size={22} />
        </div>

        {/* Text */}
        <div>

          <h2 className="text-lg font-semibold">
            Assistant
          </h2>

          <p className="text-gray-400 mt-2 leading-relaxed">
            You still have 3 pending tasks.
            Try completing the high priority ones first.
          </p>

        </div>

      </div>

    </div>
  );
}