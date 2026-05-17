import { useEffect, useRef, useState } from 'react'
import './App.css'
import AssistantFeedback from './components/AssitantFeedback'
import FloatingMic from './components/FloatingMic'
import TaskList from './components/TaskList'
import VoiceInput from './components/VoiceInput'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom'

function App() {

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, completed: 0, pending: 0});
  const [errorMsg, setErrorMsg] = useState(null);
  const [lastAudioBlob, setLastAudioBlob] = useState(null);

  const fetchTasks = async()=>{
    

      try {
        const response = await fetch("http://localhost:8000/tasks");

        const data = await response.json()
        const normalizedTasks = (data.tasks || []).map((task) => ({
          ...task,
          done: !!task.done,
        }));

        console.log(data)

        setTasks(normalizedTasks)
        setCounts({
          total: normalizedTasks.length,
          completed: normalizedTasks.filter(t => t.done).length,
          pending: normalizedTasks.filter(t => !t.done).length
        });
        setErrorMsg(null);

      }
      catch(error) {
        console.error(error);
        setErrorMsg('Unable to reach backend. Please check the server and try again.');
      }
    }
    
  useEffect(()=> {
    
    fetchTasks();
  },[])

  const handleRecording = async () => {

    console.log("App:", isRecording);

    // START RECORDING
    if (!isRecording) {

      try {

        console.log("Starting recording...");

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

        console.log("Microphone access granted");

        const mediaRecorder =
          new MediaRecorder(stream, {
            mimeType: "audio/webm",
          });

        // SAVE RECORDER IN REF
        mediaRecorderRef.current =
          mediaRecorder;

        // RESET AUDIO CHUNKS
        audioChunksRef.current = [];

        // STORE AUDIO DATA
        mediaRecorder.ondataavailable =
          (event) => {
            audioChunksRef.current.push(
              event.data
            );
          };

        // WHEN RECORDING STOPS
        mediaRecorder.onstop = async () => {

          console.log("Recording stopped");

          const audioBlob = new Blob(
            audioChunksRef.current,
            {
              type: "audio/webm",
            }
          );

          console.log("Audio Blob:", audioBlob);

          const formData =
            new FormData();

          formData.append(
            "audio",
            audioBlob,
            "recording.webm"
          );

            try {

            const response = await fetch(
              "http://localhost:8000/upload-audio",
              {
                method: "POST",
                body: formData,
              }
            );

            const data = await response.json();
            console.log(data);
            await fetchTasks();
            setErrorMsg(null);
            setLastAudioBlob(null);

          } catch (error) {
            console.error("Upload failed:", error);
            setErrorMsg('Upload failed — backend may be down.');
            setLastAudioBlob(audioBlob);
          }

        };

        console.log(
          "Before start:",
          mediaRecorder.state
        );

        // START RECORDER
        mediaRecorder.start();

        console.log(
          "After start:",
          mediaRecorder.state
        );

        setIsRecording(true);

      } catch (error) {

        console.error(
          "Microphone access denied:",
          error
        );

      }

    }

    // STOP RECORDING
    else {

      if (mediaRecorderRef.current) {

        mediaRecorderRef.current.stop();

        setIsRecording(false);

      }

    }

  };

  const retryUpload = async () => {
    if (!lastAudioBlob) return;
    const formData = new FormData();
    formData.append("audio", lastAudioBlob, "recording.webm");

    try {
      const response = await fetch("http://localhost:8000/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Retry upload failed');
      }

      const data = await response.json();
      console.log('Retry success', data);
      await fetchTasks();
      setErrorMsg(null);
      setLastAudioBlob(null);
    } catch (err) {
      console.error('Retry failed', err);
      setErrorMsg('Retry failed — backend may still be down.');
    }
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 pb-32 md:pb-6">
        {errorMsg && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="rounded-lg bg-red-600 p-3 flex items-start justify-between">
              <div className="text-sm">{errorMsg}</div>
              <div className="flex items-center gap-3">
                {lastAudioBlob && (
                  <button
                    onClick={retryUpload}
                    className="ml-2 mr-2 underline font-semibold"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => { setErrorMsg(null); setLastAudioBlob(null); }}
                  className="ml-4 font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
          <section>
            <Routes>

              <Route path="/" element={<Dashboard tasks={tasks} counts={counts} setTasks={setTasks} setCounts={setCounts} setError={setErrorMsg} />} />
              <Route path="/tasks" element={<TaskList tasks={tasks} setTasks={setTasks} setCounts={setCounts} setError={setErrorMsg} />} />
              <Route path="/feedback" element={<AssistantFeedback />} />
              <Route path="/voice" element={<VoiceInput />} />

            </Routes>
          </section>

          {/* Right column */}
          <aside className="hidden lg:flex lg:flex-col gap-5">
            <div className="sticky top-6 space-y-5">
              <VoiceInput isRecording={isRecording} handleRecording={handleRecording} />
              {/* <AssistantFeedback /> */}
            </div>
          </aside>
        </div>
      </main>

      <FloatingMic isRecording={isRecording} handleRecording={handleRecording} />




    </div>
  )
}

export default App
