import React, { useEffect, useState, useContext } from "react";
import AddTopicForm from "../models/AddTopicForm";
import { ThemeContext } from "../../context/ThemeContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import toast from "react-hot-toast";
import { apiFetch } from "../../utils/apiFetch";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  CheckCircle,
  XCircle,
  Flame,
  Percent,
  Calendar,
  BookOpen,
  User,
  ArrowUpRight,
} from "lucide-react";

export default function Dashboard() {
  const { dark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [todayTopics, setTodayTopics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [revisionLength, setRevisionLength] = useState(0);
  const [editingTopic, setEditingTopic] = useState(null);

  // ✨ NEW: smooth stagger animation state
  const [animateIn, setAnimateIn] = useState(false);

  const { analytics, setAnalytics } = useAnalytics();

  // ============================
  // COLOR INTENSITY
  // ============================
  const getColor = (count) => {
    if (count === 0) return "rgba(34,197,94,0.08)";
    if (count === 1) return "rgba(34,197,94,0.2)";
    if (count === 2) return "rgba(34,197,94,0.4)";
    if (count === 3) return "rgba(34,197,94,0.6)";
    if (count === 4) return "rgba(34,197,94,0.8)";
    return "rgba(34,197,94,1)";
  };

  // ============================
  // LOCAL DATE HELPERS
  // ============================
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentWeekMondayFirst = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const week = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      week.push({
        date: formatLocalDate(d),
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    return week;
  };

  // ============================
  // LOAD TOPICS
  // ============================
  const loadTopicsData = async () => {
    try {
      const today = formatLocalDate(new Date());

      const topicsPage = await apiFetch(
        "/api/topics?status=ACTIVE&page=0&size=50&sort=createdAt,desc",
      );

      const allTopics = topicsPage.content || [];

      //  filter today topics on frontend using local time
      const todayOnlyTopics = allTopics.filter((t) => {
        if (!t.createdAt) return false;

        const topicDate = new Date(
          typeof t.createdAt === "string"
            ? t.createdAt.replace(" ", "T")
            : t.createdAt,
        );

        return formatLocalDate(topicDate) === today;
      });

      setTodayTopics(todayOnlyTopics);

      // ✅ weekly heatmap stays same
      const days = getCurrentWeekMondayFirst();

      const weekDataFormatted = days.map((day) => ({
        count: allTopics.filter((t) => {
          if (!t.createdAt) return false;

          const topicDate = new Date(
            typeof t.createdAt === "string"
              ? t.createdAt.replace(" ", "T")
              : t.createdAt,
          );

          return formatLocalDate(topicDate) === day.date;
        }).length,
        label: day.label,
      }));

      setWeekData(weekDataFormatted);
    } catch (err) {
      console.log("Topics error:", err);
      setTodayTopics([]);
      setWeekData([]);
    }
  };

  // ============================
  // LOAD DASHBOARD
  // ============================
  const loadDashboard = async () => {
    try {
      const [userData, analyticsData, revData] = await Promise.all([
        apiFetch("/api/users/me"),
        apiFetch("/api/analytics/overview"),
        apiFetch("/api/topics/revisions/today"),
      ]);

      setUser(userData);
      setRevisions(revData || []);
      setRevisionLength(revData?.length || 0);

      const mappedAnalytics = {
        revision: {
          completedMtd: analyticsData?.revision?.completedMtd || 0,
          missedMtd: analyticsData?.revision?.missedMtd || 0,
          emailedMtd: analyticsData?.revision?.emailedMtd || 0,
          rateMtd: analyticsData?.revision?.rateMtd || 0,
        },
        challenge: {
          currentStreak: analyticsData?.challenge?.currentStreak || 0,
          progressPercent: analyticsData?.challenge?.progressPercent || 0,
          freezeRemaining: analyticsData?.challenge?.freezeRemaining || 0,
        },
      };

      setAnalytics(mappedAnalytics);
      await loadTopicsData();
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();

    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const completionRate = Math.round((analytics?.revision?.rateMtd ?? 0) * 100);

  return (
    <div className="p-3 sm:p-6 min-h-screen rounded-2xl bg-gray-200 dark:bg-[#0F172A] text-black dark:text-white space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div
        className={`p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] space-y-5
            transform transition duration-700 ease-out
            ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
      >
        {/* TOP */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight break-words">
            <span className="font-averaiserif inline">
              Hey {user?.fullName || "User"}
            </span>{" "}
            <span className="inline-block">👋</span>
          </h1>

          <button
            onClick={() => {
              setEditingTopic(null);
              setShowModal(true);
            }}
            className=" hidden sm:flex items-center gap-2 bg-amber-300 px-4 py-2 rounded-full shadow"
          >
            <Plus size={16} />
            Add Topic
          </button>
        </div>

        {/* STATS + WEEKLY */}
        <div className="space-y-5">
          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Stat
              label="Completed"
              value={analytics?.revision?.completedMtd}
              icon={<CheckCircle size={18} />}
            />
            <Stat
              label="Missed"
              value={analytics?.revision?.missedMtd}
              icon={<XCircle size={18} />}
            />
            <Stat
              label="Streak"
              value={analytics?.challenge?.currentStreak}
              icon={<Flame size={18} />}
            />
            <Stat
              label="Completion"
              value={`${completionRate}%`}
              icon={<Percent size={18} />}
            />
            <Stat
              label="Pending"
              value={revisions.length}
              icon={<Calendar size={18} />}
            />
            <div className="lg:hidden">
              <button
                onClick={() => navigate("/app/profile")}
                className="w-full  min-h-[88px] px-5 py-4 rounded-full bg-amber-300 dark:bg-[#0F172A] text-center"
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <User size={18} />
                  <p className="text-sm">Profile</p>
                </div>

                <h2 className="text-3xl font-averaiserif font-bold ">
                  <ArrowUpRight />
                </h2>
              </button>
            </div>
          </div>

          {/* WEEKLY */}
          <div>
            <h3 className="text-sm font-semibold font-averaiserif text-gray-500 mb-2">
              Weekly Activity
            </h3>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {(weekData.length
                ? weekData
                : Array(7).fill({ count: 0, label: "" })
              ).map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-full h-6">
                    <div
                      title={`${day.count} topics`}
                      className="w-full h-full rounded-md"
                      style={{ backgroundColor: getColor(day.count) }}
                    />
                  </div>

                  <p className="text-[10px] mt-1 text-gray-500">{day.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TODAY LEARNINGS */}
      <div
        className={`p-4 rounded-2xl bg-white dark:bg-[#1E293B]
            transform transition duration-700 delay-200 ease-out
            ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen size={18} />
            Today’s Learnings ({todayTopics.length})
          </h2>

          <button
            onClick={() => navigate("/app/topics")}
            className="self-start sm:self-auto bg-amber-300 px-3 py-1.5 rounded-full text-sm shadow"
          >
            Go to
          </button>
        </div>

        {todayTopics.length > 0 ? (
          todayTopics.map((t) => (
            <div
              key={t.id}
              className="p-3 mb-2 rounded-lg bg-gray-100 dark:bg-[#0F172A] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
            >
              <div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-xs text-gray-500">{t.subject}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No topics added today</p>
        )}
      </div>

      {/* REVISIONS */}
      <div
        className={`p-4 rounded-2xl bg-white dark:bg-[#1E293B]
            transform transition duration-700 delay-500 ease-out
            ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
      >
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar size={18} />
          Today's Revisions ({revisionLength})
        </h2>

        {revisions.length > 0 ? (
          revisions.map((r) => (
            <div
              key={r.revisionScheduleId}
              className="p-3 mb-2 rounded-lg bg-gray-100 dark:bg-[#0F172A] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
            >
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-gray-500">
                  {r.subject} • Day {r.dayNumber}
                </p>
              </div>

              <button
                onClick={() => navigate("/app/revisions")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-300 text-sm shadow"
              >
                <Calendar size={14} />
                Go
              </button>
            </div>
          ))
        ) : (
          <p>No revisions today</p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-3">
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl w-full max-w-lg">
            <AddTopicForm
              closeModal={() => setShowModal(false)}
              editingTopic={editingTopic}
              refreshTopics={loadDashboard}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================
const Stat = ({ icon, label, value }) => (
  <div className="p-4 rounded-xl bg-gray-100 dark:bg-[#0F172A]">
    <div className="flex items-center gap-2 text-gray-500">
      {icon}
      <p className="text-sm">{label}</p>
    </div>
    <h2 className="text-3xl font-averaiserif font-bold">{value || 0}</h2>
  </div>
);
