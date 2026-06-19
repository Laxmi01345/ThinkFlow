import { useEffect, useRef, useState } from 'react'
import './App.css'
import AssistantFeedback from './components/AssitantFeedback'
import FloatingMic from './components/FloatingMic'
import TaskList from './components/TaskList'
import VoiceInput from './components/VoiceInput'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './context/AuthContext'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Mic } from 'lucide-react'
import logo from './assets/logo.png'

function App() {
  const { user, token, loading, logout } = useAuth()
  const [authPage, setAuthPage] = useState('login')

  const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  console.log("API_BASE:", API_BASE);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const audioChunksRef = useRef([])
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [assistantReply, setAssistantReply] = useState(null);
  const [lastAudioBlob, setLastAudioBlob] = useState(null);

  const getAuthHeaders = () => {
    const t = localStorage.getItem('tf_token')
    return t ? { Authorization: `Bearer ${t}` } : {}
  };

  const readResponseBody = async (response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  };

  const fetchTasksAsync = async () => {
    setLoadingTasks(true);
    try {
      setAssistantReply(null);
      const response = await fetch(`${API_BASE}/tasks`, {
        headers: getAuthHeaders(),
      });

      const data = await readResponseBody(response);

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(typeof data === 'string' ? data : 'Failed to load tasks');
      }

      const normalizedTasks = (data.tasks || []).map((task) => ({
        ...task,
        done: !!task.done,
      }));

      setTasks(normalizedTasks);
      setErrorMsg(null);
    } catch(error) {
      console.error(error);
      setErrorMsg('Unable to reach backend. Please check the server and try again.');
    } finally {
      setLoadingTasks(false);
    }
  }

  useEffect(()=>{
    let cancelled = false
    const run = async () => {
      if (user && token && !cancelled) {
        const headers = { Authorization: `Bearer ${token}` }
        setLoadingTasks(true)
        try {
          setAssistantReply(null)
          const response = await fetch(`${API_BASE}/tasks`, {
            headers,
          })

          if (cancelled) return
          const data = await readResponseBody(response)

          if (response.status === 401) {
            logout()
            return
          }

          if (!response.ok) {
            throw new Error(typeof data === 'string' ? data : 'Failed to load tasks')
          }

          const normalizedTasks = (data.tasks || []).map((task) => ({
            ...task,
            done: !!task.done,
          }))

          if (!cancelled) {
            setTasks(normalizedTasks)
            setErrorMsg(null)
          }
        } catch(error) {
          if (!cancelled) {
            console.error(error)
            setErrorMsg('Unable to reach backend. Please check the server and try again.')
          }
        } finally {
          if (!cancelled) setLoadingTasks(false)
        }
      }
    }
    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user, token])

  const handleRecording = async () => {
    if (isProcessing) {
      return;
    }

    console.log("App:", isRecording);

    // START RECORDING
    if (!isRecording) {

      try {

        console.log("Starting recording...");

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
        mediaStreamRef.current = stream;

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
          setIsProcessing(true);

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
              `${API_BASE}/upload-audio`,
              {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData,
              }
            );

            const data = await readResponseBody(response);

            if (response.status === 401) {
              logout();
              return;
            }

            if (!response.ok) {
              throw new Error(
                typeof data === 'string'
                  ? data
                  : data?.detail || 'Upload request failed'
              );
            }

            console.log(data);
            await fetchTasksAsync();
            setErrorMsg(null);
            setAssistantReply(data.reply || 'Task added successfully.');
            setLastAudioBlob(null);

          } catch (error) {
            console.error("Upload failed:", error);
            setErrorMsg('Upload failed — backend may be down.');
            setLastAudioBlob(audioBlob);
          } finally {
            setIsProcessing(false);
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((track) => track.stop());
              mediaStreamRef.current = null;
            }
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
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", lastAudioBlob, "recording.webm");

    try {
      const response = await fetch(`${API_BASE}/upload-audio`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await readResponseBody(response);

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === 'string'
            ? data
            : data?.detail || 'Retry upload failed'
        );
      }

      console.log('Retry success', data);
      await fetchTasksAsync();
      setErrorMsg(null);
      setAssistantReply(data.reply || 'Task added successfully.');
      setLastAudioBlob(null);
    } catch (err) {
      console.error('Retry failed', err);
      setErrorMsg('Retry failed — backend may still be down.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1e1e1e]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return authPage === 'login'
      ? <Login onSwitch={() => setAuthPage('signup')} />
      : <Signup onSwitch={() => setAuthPage('login')} />
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white overflow-hidden">

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ThinkFlow" className="h-8 w-8 rounded-2xl object-cover" />
          <h1 className="text-lg font-bold">ThinkFlow</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/30 transition">Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-scrollbar flex-1 overflow-y-auto p-6 pb-32 md:pb-6">
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

              <Route path="/" element={<Dashboard tasks={tasks} setTasks={setTasks} setError={setErrorMsg} isLoading={loadingTasks} assistantReply={assistantReply} isProcessing={isProcessing} onDismissAssistant={() => setAssistantReply(null)} />} />
              <Route path="/tasks" element={<TaskList tasks={tasks} setTasks={setTasks} setError={setErrorMsg} isLoading={loadingTasks} />} />
              <Route path="/feedback" element={<AssistantFeedback />} />
              <Route path="/voice" element={<VoiceInput isRecording={isRecording} isProcessing={isProcessing} handleRecording={handleRecording} />} />
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </section>

          {/* Right column */}
          <aside className="hidden lg:flex lg:flex-col gap-5">
            <div className="sticky top-6 space-y-5">
              <VoiceInput isRecording={isRecording} isProcessing={isProcessing} handleRecording={handleRecording} />
              <AssistantFeedback loading={isProcessing} message={assistantReply} onDismiss={() => setAssistantReply(null)} />
            </div>
          </aside>
        </div>
      </main>

      <FloatingMic isRecording={isRecording} isProcessing={isProcessing} handleRecording={handleRecording} />




    </div>
  )
}

export default App
