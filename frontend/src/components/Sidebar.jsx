import {
  Mic,
  CheckSquare,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.png";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside
      className="
        w-[240px]
        h-screen
        bg-[#1a1a1a]
        text-white
        flex
        flex-col
        justify-between
        p-5
      "
    >

      {/* Top Section */}
      <div>

        

        {/* Logo */}
        <LogoBlock />

        {/* Navigation */}

        <nav className="space-y-3">

            <NavLink
            to="/"
            className={({ isActive }) =>
              `
                flex items-center gap-3
                p-3 rounded-2xl transition
                ${
                  isActive
                    ? "bg-blue-500"
                    : "hover:bg-[#2a2a2a]"
                }
              `
            }
          >
            <CheckSquare size={20} />
            Dashboard
          </NavLink>

          {/* Tasks
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `
                flex items-center gap-3
                p-3 rounded-2xl transition
                ${
                  isActive
                    ? "bg-blue-500"
                    : "hover:bg-[#2a2a2a]"
                }
              `
            }
          >
            <CheckSquare size={20} />
            Tasks
          </NavLink>

          Voice
          <NavLink
            to="/voice"
            className={({ isActive }) =>
              `
                flex items-center gap-3
                p-3 rounded-2xl transition
                ${
                  isActive
                    ? "bg-blue-500"
                    : "hover:bg-[#2a2a2a]"
                }
              `
            }
          >
            <Mic size={20} />
            Voice
          </NavLink> */}

        </nav>

      </div>

      {/* Bottom Section */}
      <div className="space-y-3">

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `
              flex items-center gap-3
              p-3 rounded-2xl transition
              ${
                isActive
                  ? "bg-blue-500"
                  : "hover:bg-[#2a2a2a]"
              }
            `
          }
        >
          <User size={20} />
          Profile
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `
              flex items-center gap-3
              p-3 rounded-2xl transition
              ${
                isActive
                  ? "bg-blue-500"
                  : "hover:bg-[#2a2a2a]"
              }
            `
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>

      </div>

    </aside>
  );
}

function LogoBlock() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center gap-3 mb-12">
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