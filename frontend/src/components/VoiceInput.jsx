import { Mic, Square } from "lucide-react";

export default function VoiceInput({
  isRecording,
  isProcessing = false,
  handleRecording
}) {

  console.log("voiceinput : " ,isRecording)

  return (

    <div className="hidden rounded-3xl bg-[#2a2a2a] p-10 md:block">

      <div className="flex flex-col items-center justify-center">

        {/* Mic Button */}
        <button
          onClick={handleRecording}
          disabled={isProcessing}
          className={`
            flex h-24 w-24 items-center justify-center
            rounded-full
            transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70
            ${
              isProcessing
                ? "bg-slate-500"
                : isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
            }
          `}
        >

          {isProcessing ? (
            <span className="text-2xl font-bold animate-pulse">...</span>
          ) : isRecording ? (
            <Square size={40} />
          ) : (
            <Mic size={40} />
          )}

        </button>

        {/* Title */}
        <h2 className="mt-6 text-2xl font-semibold">

          {isProcessing ? "Processing..." : isRecording ? "Recording..." : "Tap to start speaking"}

        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-gray-400">

          {isProcessing ? "Saving your task to the database" : isRecording ? "Tap again to stop recording" : "Your voice assistant is ready"}

        </p>

      </div>

    </div>

  );
}