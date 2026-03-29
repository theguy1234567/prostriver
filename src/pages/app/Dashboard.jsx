import React, { useEffect, useState, useContext } from "react";
import AddTopicForm from "../models/AddTopicForm";
import { ThemeContext } from "../../context/ThemeContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch"; // ✅ IMPORTANT

import {
  Plus,
  CheckCircle,
  XCircle,
  Flame,
  Percent,
  Calendar,
  Target,
  BookOpen,
  Archive,
  Activity,
  Pencil,
} from "lucide-react";

export default function Dashboard() {
  const { dark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [revisionLength, setRevisionLength] = useState(0);
  const [editingTopic, setEditingTopic] = useState(null);

  const { analytics, setAnalytics } = useAnalytics();

  // ============================
  // WEEK DATA
  // ============================
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const loadWeekData = async () => {
    try {
      const days = getLast7Days();

      const results = await Promise.all(
        days.map((d) =>
          apiFetch(`/api/topics?createdDate=${d}`)
            .then((data) => (data.content ? data.content.length : data.length))
            .catch(() => 0),
        ),
      );

      setWeekData(results);
    } catch {
      setWeekData([]);
    }
  };

  // ============================
  // MAIN DASHBOARD LOAD
  // ============================
  const loadDashboard = async () => {
    try {
      const [userData, analyticsData, revData] = await Promise.all([
        apiFetch("/api/users/me"),
        apiFetch("/api/analytics/overview"),
        apiFetch("/api/topics/revisions/today"),
      ]);

      setUser(userData);
      setRevisions(revData);
      setRevisionLength(revData?.length || 0);

      const mappedAnalytics = {
        revision: {
          completedMtd: analyticsData?.gauge?.completed || 0,
          missedMtd: analyticsData?.gauge?.missed || 0,
          emailedMtd: analyticsData?.gauge?.emailed || 0,
          rateMtd: analyticsData?.gauge?.rate || 0,
        },
        challenge: {
          currentStreak: analyticsData?.challengeInfo?.currentStreak || 0,
          progressPercent: analyticsData?.challengeInfo?.progressPercent || 0,
          freezeRemaining: analyticsData?.challengeInfo?.freezeRemaining || 0,
        },
      };

      setAnalytics(mappedAnalytics);

      await loadWeekData();
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const completionRate = Math.round((analytics?.revision?.rateMtd ?? 0) * 100);

  const topicStats = {
    active: topics.filter((t) => t.status === "ACTIVE").length,
    completed: topics.filter((t) => t.status === "COMPLETED").length,
    archived: topics.filter((t) => t.status === "ARCHIVED").length,
  };

  return (
    <div className="p-3 sm:p-6 min-h-screen rounded-2xl bg-gray-200 dark:bg-[#0F172A] text-black dark:text-white space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Hey {user?.fullName || "User"}
            </h1>
            <p className="text-sm text-gray-500">
              What do you want to learn today?
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTopic(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-amber-300 px-4 py-2 rounded-full shadow"
          >
            <Plus size={16} />
            Add Topic
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
            label="Scheduled"
            value={analytics?.revision?.emailedMtd}
            icon={<Calendar size={18} />}
          />
        </div>
      </div>

      {/* REVISIONS */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B]">
        <h2 className="text-lg font-semibold mb-3">
          Today's Revisions ({revisionLength})
        </h2>

        {revisions.length > 0 ? (
          revisions.map((r) => (
            <div
              key={r.revisionScheduleId}
              className="p-3 mb-2 rounded-lg bg-gray-100 dark:bg-[#0F172A]"
            >
              <p className="font-semibold">{r.title}</p>
              <p className="text-xs text-gray-500">
                {r.subject} • Day {r.dayNumber}
              </p>
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
    <h2 className="text-3xl font-bold">{value || 0}</h2>
  </div>
);
