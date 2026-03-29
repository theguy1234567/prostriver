import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { useAnalytics } from "../../context/AnalyticsContext";

// ✅ Lucide Icons
import { Home, BookOpen, Brain, Zap, Sun, Moon, Plus } from "lucide-react";

export default function App_nav() {
  const location = useLocation();
  const navigate = useNavigate();

  const { dark, setDark } = useContext(ThemeContext);
  const { user, setAccessToken } = useContext(AuthContext);
  const { analytics } = useAnalytics();

  const streak = analytics?.challenge?.currentStreak || 0;

  const prevStreakRef = useRef(streak);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (streak > prevStreakRef.current) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 800);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  // ✅ NAV ITEMS (icons updated)
  const navItems = [
    { name: "Dashboard", path: "/app", icon: Home },
    { name: "Topics", path: "/app/topics", icon: BookOpen },
    { name: "Revisions", path: "/app/revisions", icon: Brain },
    { name: "Challenges", path: "/app/challenges", icon: Zap },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    navigate("/login");
  };

  return (
    <>
      {/* 🌙 MOBILE THEME TOGGLE (TOP LEFT) */}
      <div className="sm:hidden fixed top-2 left-3 z-1">
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-full bg-gray-100 dark:bg-[#1E293B] shadow"
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* 🔥 MOBILE STREAK */}
      <div className="sm:hidden fixed top-2 right-3 z-50">
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-[#1E293B] shadow">
          {Array.from({ length: Math.min(streak, 10) }).map((_, i) => (
            <span
              key={i}
              className={`text-sm font-bold transition-all duration-500
              ${
                animate
                  ? "rotate-180 text-green-400 scale-125"
                  : "text-yellow-400"
              }`}
            >
              +
            </span>
          ))}
          <span className="ml-2 font-semibold text-xs text-black dark:text-white">
            {streak}
          </span>
        </div>
      </div>

      {/* 💻 DESKTOP NAV */}
      <div className="hidden sm:flex fixed top-0 left-0 w-full z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-3 items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-black dark:text-white">
          ProStriver
        </h1>

        <div className="flex items-center gap-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-1 rounded-lg transition
                ${
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800"
          >
            {dark ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ➕ FLOATING BUTTON */}
      <div className="sm:hidden fixed bottom-[10px] left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => navigate("/app/topics")}
          className="w-20 h-20 bg-amber-400 rounded-full text-2xl text-white border-4 border-white dark:border-zinc-900 flex items-center justify-center"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* 📱 BOTTOM NAV */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full z-40 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-evenly gap-20 items-center py-3 shadow-lg">
        {/* LEFT */}
        <div className="flex gap-8">
          {navItems.slice(0, 2).map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center transition
                ${
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

        {/* RIGHT */}
        <div className="flex gap-8">
          {navItems.slice(2, 4).map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center transition
                ${
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
