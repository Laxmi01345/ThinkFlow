// src/components/FloatingMic.jsx

import { Mic, Square } from "lucide-react";

export default function FloatingMic({isRecording , handleRecording}) {

   
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:hidden">
      <button
        className={`
          flex h-14 w-full items-center justify-center gap-2
          rounded-2xl shadow-2xl transition
          ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }
        `}
        onClick={handleRecording}
      >
        {isRecording ? <Square size={20} /> : <Mic size={20} />}
        <span className="text-base font-semibold">
          {isRecording ? "Tap to stop" : "Tap to speak"}
        </span>
      </button>
    </div>
  );
}