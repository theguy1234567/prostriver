import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { apiFetch } from "../../utils/apiFetch";
import logo from "../../assets/logo.jpg";

import {
  Home,
  RefreshCcw,
  BarChart3,
  Trophy,
  Sun,
  Moon,
  Plus,
  UserRound,
  KeyRound,
  LogOut,
} from "lucide-react";

export default function App_nav({ onOpenAddTopic }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { dark, setDark } = useContext(ThemeContext);
  const { setAccessToken, user } = useContext(AuthContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ fixed: separate refs for mobile + desktop
  const mobileDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);

  const firstLetter = user?.fullName?.charAt(0)?.toUpperCase() || "U";

  const navItems = [
    { name: "Dashboard", path: "/app", icon: Home },
    { name: "Revisions", path: "/app/revisions", icon: RefreshCcw },
    { name: "Analytics", path: "/app/analytics", icon: BarChart3 },
    { name: "Challenges", path: "/app/challenges", icon: Trophy },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      const clickedInsideMobile =
        mobileDropdownRef.current &&
        mobileDropdownRef.current.contains(e.target);

      const clickedInsideDesktop =
        desktopDropdownRef.current &&
        desktopDropdownRef.current.contains(e.target);

      if (!clickedInsideMobile && !clickedInsideDesktop) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      navigate("/login");
    }
  };

  return (
    <>
      {/* mobile top controls */}
      <div
        className="sm:hidden fixed top-2 left-0 w-full px-3 z-[120] flex justify-between items-center"
        ref={mobileDropdownRef}
      >
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-full bg-gray-100 dark:bg-[#1E293B] shadow"
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-10 h-10 rounded-full bg-amber-400 text-white font-bold flex items-center justify-center shadow-md"
        >
          {firstLetter}
        </button>

        {dropdownOpen && (
          <div className="absolute top-12 right-3 w-56 rounded-2xl border dark:text-white border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden z-[130]">
            <button
              onClick={() => {
                navigate("/app/profile");
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <UserRound size={18} />
              Profile
            </button>

            <button
              onClick={() => {
                navigate("/app/change-password");
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <KeyRound size={18} />
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* desktop nav */}
      <div className="hidden sm:flex fixed top-0 left-0 w-full z-50 dark:bg-zinc-900/30 border-b border-gray-200 dark:border-zinc-800 backdrop-blur-2xl h-20 rounded-b-2xl px-4 lg:px-6 py-3 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-fit z-10">
          {/* <div className="h-11 w-11 rounded-2xl overflow-hidden shadow-md ring-1 ring-gray-200 dark:ring-zinc-700 bg-white dark:bg-zinc-800">
            <img
              className="h-full w-full object-cover"
              src={logo}
              alt="ProStriver Logo"
            />
          </div> */}

          <h1 className="text-xl font-averaiserif font-bold tracking-tight text-black dark:text-white">
            <Link to={"/"}>ProStriver</Link>
          </h1>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex font-garamound items-center gap-2 lg:gap-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-2 lg:px-3 py-2 text-sm lg:text-base duration-700 rounded-full transition ease-out whitespace-nowrap ${
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-black dark:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div
          className="flex items-center gap-3 min-w-fit z-10 relative"
          ref={desktopDropdownRef}
        >
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800"
          >
            {dark ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-11 h-11 rounded-full bg-amber-400 text-white font-bold flex items-center justify-center shadow-md hover:scale-105 transition"
          >
            {firstLetter}
          </button>

          {dropdownOpen && (
            <div className="absolute top-14 right-0 w-56 rounded-2xl border dark:text-white border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
              <button
                onClick={() => {
                  navigate("/app/profile");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <UserRound size={18} />
                Profile
              </button>

              <button
                onClick={() => {
                  navigate("/app/change-password");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <KeyRound size={18} />
                Change Password
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* mobile add topic button */}
      <div className="sm:hidden fixed bottom-[10px] left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={onOpenAddTopic}
          className="w-20 h-20 bg-amber-400 rounded-full text-2xl text-white border-4 border-white dark:border-zinc-900 flex items-center justify-center"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full z-40 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-evenly gap-20 items-center py-3 shadow-lg">
        <div className="flex gap-8">
          {navItems.slice(0, 2).map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center transition ${
                  active
                    ? "text-amber-400 scale-110"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon size={24} />
              </Link>
            );
          })}
        </div>

        <div className="flex gap-8">
          {navItems.slice(2, 4).map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center transition ${
                  active
                    ? "text-amber-400 scale-110"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon size={24} />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
