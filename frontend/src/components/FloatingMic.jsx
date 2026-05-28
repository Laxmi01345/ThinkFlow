// src/components/FloatingMic.jsx

import { Mic, Square } from "lucide-react";

export default function FloatingMic({ isRecording, isProcessing = false, handleRecording }) {

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:hidden">
      <button
        disabled={isProcessing}
        className={`
          flex h-14 w-full items-center justify-center gap-2
          rounded-2xl shadow-2xl transition
          disabled:cursor-not-allowed disabled:opacity-70
          ${
            isProcessing
              ? "bg-slate-500"
              : isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
          }
        `}
        onClick={handleRecording}
      >
        {isProcessing ? <span className="text-lg font-bold animate-pulse">...</span> : isRecording ? <Square size={20} /> : <Mic size={20} />}
        <span className="text-base font-semibold">
          {isProcessing ? "Processing" : isRecording ? "Tap to stop" : "Tap to speak"}
        </span>
      </button>
    </div>
  );
}