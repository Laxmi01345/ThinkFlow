

export default function Tasks() {
    return (
        <>
          <NavLink
                to="/feedback"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 transition ${isActive
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`
                }
            >
                <CheckSquare size={22} />
                <span className="text-xs">Assistant</span>
            </NavLink>
        </>
    );
}


<Routes>

          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/feedback" element={<AssistantFeedback />} />
          <Route path="/voice" element={<VoiceInput />} />

          {/* <Route path="/profile" element={<Profile />} />

          <Route path="/settings" element={<Settings />} /> */}

        </Routes>