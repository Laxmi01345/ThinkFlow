import { useState } from "react";
import Greeting from "../components/Greeting";
import StatsCards from "../components/StatsCards";
import TaskList from "../components/TaskList";
import AssistantFeedback from "../components/AssitantFeedback";
import { Mic } from "lucide-react";
import logo from "../assets/logo.png"
export default function Dashboard({ tasks, counts, setTasks, setCounts, setError, isLoading = false }) {
        return (
                <div className="mx-auto w-full max-w-4xl space-y-8">

                        <LogoBlock />

                        {/* Main Content */}
                        <main className="mx-auto w-full max-w-3xl p-2 sm:p-4">
                                <Greeting />
                                {/* <StatsCards counts={counts} /> */}
                                <section className="space-y-5 mt-5">

                                        {/* <section className="bg-[#232336] rounded-3xl p-6 space-y-4"> */}

                                        {/* Header */}
                                        {/* <div className="flex items-center justify-between">

                                                <div>

                                                        <h2 className="text-xl font-semibold">
                                                                Today's Progress
                                                        </h2>

                                                        <p className="text-gray-400 text-sm mt-1">
                                                                Keep pushing your tasks 🚀
                                                        </p>

                                                </div>

                                                <span className="text-blue-400 font-semibold">
                                                        {tasks.filter(t => t.done).length} / {tasks.length}
                                                </span>

                                                <span className="text-blue-400 font-semibold">
                                                        {Math.round((tasks.filter(t => t.done).length / (tasks.length || 1)) * 100)}%
                                                </span>

                                        </div> */}

                                        {/* Progress Bar
                                        <div className="w-full bg-[#2a2a2a] rounded-full h-3">

                                                <div
                                                        className="bg-blue-500 h-3 rounded-full transition-all "
                                                        style={{ width: `${Math.round((tasks.filter(t => t.done).length / (tasks.length || 1)) * 100)}%` }}
                                                />

                                        </div> */}

                                        {/* </section> */}

                                        {/* Tasks */}
                                        <TaskList tasks={tasks} setTasks={setTasks} setCounts={setCounts} setError={setError} isLoading={isLoading} />

                                </section>
                        </main>

                        {/* Mobile Assistant Feedback */}
                        {/* <div className="mx-auto w-full max-w-3xl lg:hidden">
                                <AssistantFeedback />
                        </div> */}

                </div>
        );
}

function LogoBlock() {
        const [imgError, setImgError] = useState(false);

        return (
                <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
                                {!imgError ? (
                                <img
                                        src={logo}
                                        alt="ThinkFlow logo"
                                        className="h-8 w-8 rounded-2xl object-cover"
                                        onError={() => setImgError(true)}
                                />
                        ) : (
                                <div className="bg-blue-500 p-3 rounded-2xl">
                                        <Mic size={22} />
                                </div>
                        )}

                        <div>
                                <h1 className="text-xl font-bold">ThinkFlow</h1>
                                <p className="text-gray-400 text-sm">Productivity Assistant</p>
                        </div>
                </div>
        );
}