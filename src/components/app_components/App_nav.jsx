import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import { apiFetch } from "../../utils/apiFetch";

import {
  Home,
  BookOpen,
  Brain,
  Zap,
  Sun,
  Moon,
  Plus,
  UserRound,
} from "lucide-react";

export default function App_nav({ onOpenAddTopic }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { dark, setDark } = useContext(ThemeContext);
  const { setAccessToken } = useContext(AuthContext);

  const { analytics } = useAnalytics();

  const challenge = analytics?.challenge;
  const challengeProgress = challenge?.progressPercent || 0;
  const hasChallenge = !!challenge;

  const navItems = [
    { name: "Dashboard", path: "/app", icon: Home },
    { name: "Topics", path: "/app/topics", icon: BookOpen },
    { name: "Revisions", path: "/app/revisions", icon: Brain },
    { name: "Challenges", path: "/app/challenges", icon: Zap },
    { name: "Profile", path: "/app/profile", icon: UserRound },
  ];

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
      {/* 🌙 MOBILE THEME TOGGLE */}
      <div className="sm:hidden fixed top-2 left-3 z-10">
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-full bg-gray-100 dark:bg-[#1E293B] shadow"
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* 📱 MOBILE CHALLENGE PROGRESS */}
      <div className="sm:hidden fixed top-3 right-3 z-50">
        <button
          onClick={() => navigate("/app/challenges")}
          className="px-3 py-2 rounded-full bg-gray-100 dark:bg-[#1E293B] shadow min-w-[120px]"
        >
          {hasChallenge ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold">Challenge</span>
              <span className="text-[10px]">•</span>
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${challengeProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <span className="text-xs font-semibold">Start</span>
          )}
        </button>
      </div>

      {/* 💻 DESKTOP NAV */}
      <div className="hidden sm:grid fixed top-0 left-0 w-full z-50 grid-cols-[auto_1fr_auto] dark:bg-zinc-900/30 border-b border-gray-200 dark:border-zinc-800 backdrop-blur-sm h-20 rounded-b-2xl px-4 lg:px-6 py-3 items-center shadow-sm gap-4">
        {/* LEFT */}
        <div className="flex items-center justify-self-start min-w-fit">
          <h1 className="text-lg lg:text-xl font-garamound font-bold text-black dark:text-white whitespace-nowrap">
            ProStriver
          </h1>
        </div>

        {/* CENTER */}
        <div className="flex font-garamound items-center gap-2 lg:gap-4 justify-center flex-wrap">
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

        {/* RIGHT */}
        <div className="flex items-center gap-2 lg:gap-3 justify-self-end min-w-fit">
          {/* ✅ CHALLENGE BEFORE DARK MODE */}
          <button
            onClick={() => navigate("/app/challenges")}
            className="cursor-pointer hidden lg:block min-w-[170px]"
          >
            {hasChallenge ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-garamound text-gray-500 dark:text-gray-400">
                  Challenge
                </span>
                <span className="text-xs text-gray-400">•</span>

                <div className="w-20 h-2 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-700 ease-out"
                    style={{ width: `${challengeProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm font-garamound text-gray-500 dark:text-gray-400">
                Start a Challenge
              </span>
            )}
          </button>

          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800"
          >
            {dark ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 font-garamound rounded-full hover:bg-red-600 text-white px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ➕ FLOATING BUTTON */}
      <div className="sm:hidden fixed bottom-[10px] left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={onOpenAddTopic}
          className="w-20 h-20 bg-amber-400 rounded-full text-2xl text-white border-4 border-white dark:border-zinc-900 flex items-center justify-center"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* 📱 BOTTOM NAV */}
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
