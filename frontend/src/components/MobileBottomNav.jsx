import {
    CheckSquare,
    House,
    User,
    Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
export default function MobileBottomNav() {
    return (
        <div
            className="
        fixed
        bottom-0
        left-0
        right-0
        bg-[#1a1a1a]
        border-t border-gray-800
        px-4
        py-3
        flex
        items-center
        justify-around
        z-50
      "
        >

            {/* Home */}
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 transition ${isActive
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`
                }
            >
                <House size={22} />
                <span className="text-xs">Home</span>
            </NavLink>

            {/* Tasks */} 
            <NavLink
                to="/tasks"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 transition ${isActive
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`
                }
            >
                <CheckSquare size={22} />
                <span className="text-xs">Tasks</span>
            </NavLink>



            {/* Profile */}
            <button className="flex flex-col items-center gap-1 text-gray-400">
                <User size={22} />
                <span className="text-xs">Profile</span>
            </button>

            {/* Settings */}
            <button className="flex flex-col items-center gap-1 text-gray-400">
                <Settings size={22} />
                <span className="text-xs">Settings</span>
            </button>

        </div>
    );
}