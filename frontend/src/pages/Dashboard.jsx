import Greeting from "../components/Greeting";
import TaskList from "../components/TaskList";
import AssistantFeedback from "../components/AssitantFeedback";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({
        tasks,
        setTasks,
        setCounts,
        setError,
        isLoading = false,
        assistantReply = null,
        isProcessing = false,
        onDismissAssistant = null,
}) {
        const { user } = useAuth();
        const userName = user?.email?.split('@')[0] || '';
        return (
                <div className="mx-auto w-full max-w-4xl space-y-8">

                        {/* Main Content */}
                        <main className="mx-auto w-full max-w-3xl p-2 sm:p-4">
                                <Greeting userName={userName} />
                                <section className="space-y-5 mt-5">
                                        <TaskList tasks={tasks} setTasks={setTasks} setCounts={setCounts} setError={setError} isLoading={isLoading} />
                                </section>
                        </main>

                        {/* Mobile Assistant Feedback */}
                        <div className="mx-auto w-full max-w-3xl px-2 lg:hidden">
                                <AssistantFeedback
                                        loading={isProcessing}
                                        message={assistantReply}
                                        onDismiss={onDismissAssistant}
                                />
                        </div>

                </div>
        );
}
