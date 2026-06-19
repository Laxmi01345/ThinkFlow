import {
  Mic,
  CheckSquare,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.png";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

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

        {/* User info & Logout */}
        <div className="rounded-2xl bg-[#2a2a2a] p-3">
          <p className="text-xs text-gray-400 truncate mb-2">{user?.email}</p>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full text-left text-red-400 hover:text-red-300 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

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