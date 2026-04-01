import React, { useEffect, useState, useContext } from "react";
import AddTopicForm from "../models/AddTopicForm";
import { ThemeContext } from "../../context/ThemeContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import toast from "react-hot-toast";
import { apiFetch } from "../../utils/apiFetch";
import { useNavigate } from "react-router-dom";

import { Plus, Flame, Calendar, BookOpen } from "lucide-react";

export default function Dashboard() {
  const { dark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [todayTopics, setTodayTopics] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [revisionLength, setRevisionLength] = useState(0);
  const [editingTopic, setEditingTopic] = useState(null);

  // ✅ staggered animation states
  const [heroIn, setHeroIn] = useState(false);
  const [revisionIn, setRevisionIn] = useState(false);
  const [topicsIn, setTopicsIn] = useState(false);

  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [revisionPlanDetails, setRevisionPlanDetails] = useState(null);

  const { analytics, setAnalytics } = useAnalytics();

  const getColor = (count) => {
    if (count === 0) return "rgba(34,197,94,0.08)";
    if (count === 1) return "rgba(34,197,94,0.2)";
    if (count === 2) return "rgba(34,197,94,0.4)";
    if (count === 3) return "rgba(34,197,94,0.6)";
    if (count === 4) return "rgba(34,197,94,0.8)";
    return "rgba(34,197,94,1)";
  };

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

  const loadTopicsData = async () => {
    try {
      const today = formatLocalDate(new Date());

      const topicsPage = await apiFetch(
        "/api/topics?page=0&size=50&sort=createdAt,desc",
      );

      const allTopics = topicsPage.content || [];

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

      setAnalytics({
        challenge: {
          currentStreak: analyticsData?.challenge?.currentStreak || 0,
          progressPercent: analyticsData?.challenge?.progressPercent || 0,
          freezeRemaining: analyticsData?.challenge?.freezeRemaining || 0,
        },
      });

      await loadTopicsData();
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();

    const timer1 = setTimeout(() => setHeroIn(true), 120);
    const timer2 = setTimeout(() => setRevisionIn(true), 320);
    const timer3 = setTimeout(() => setTopicsIn(true), 520);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const progress = Math.min(
    100,
    Math.round(analytics?.challenge?.progressPercent || 0),
  );

  return (
    <div className="p-3 sm:p-6 min-h-screen rounded-2xl bg-gray-200 dark:bg-[#0F172A] text-black dark:text-white space-y-4 sm:space-y-6">
      {/* HERO */}
      <div
        className={`p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] space-y-5 transition-all duration-700 ${
          heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="flex flex-row justify-between rounded-full">
          <div className="flex flex-col sm:flex-col sm:justify-between gap-3">
            <h1 className="text-3xl sm:text-5xl font-averaiserif font-bold">
              Hey {user?.fullName || "User"} 👋
            </h1>
            <p className="font-averaiserif">Welcome to Prostriver!</p>
            <p className="font-averaiserif">what do you want to learn today?</p>
          </div>

          <div className="flex gap-2">
            <div className="rounded-full bg-amber-300 dark:bg-[#1E293B] p-4 flex flex-col h-30 w-30 items-center justify-center shrink-0">
              <Flame size={28} />
              <h2 className="text-3xl text-center font-averaiserif font-bold">
                {analytics?.challenge?.currentStreak || 0}
              </h2>
            </div>

            <div className="rounded-full bg-amber-300 dark:bg-[#1E293B] p-4 flex flex-col h-30 w-30 items-center justify-center shrink-0">
              <Calendar size={28} />
              <h2 className="text-3xl text-center font-averaiserif font-bold">
                {revisions.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-100 dark:bg-[#0F172A] p-5">
          <p className="text-sm text-gray-500">Challenge Progress</p>
          <h3 className="text-2xl font-bold">{progress}%</h3>
          <div className="w-full h-4 rounded-full bg-gray-300 dark:bg-[#1E293B] overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-amber-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-start justify-between gap-4 mt-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Weekly Activity
              </h3>

              <div className="grid grid-cols-7 gap-2">
                {(weekData.length
                  ? weekData
                  : Array(7).fill({ count: 0, label: "" })
                ).map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-full h-6 rounded-md"
                      style={{ backgroundColor: getColor(day.count) }}
                    />
                    <p className="text-[10px] mt-1 text-gray-500">
                      {day.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODAY REVISIONS */}
      <div
        className={`p-4 rounded-2xl bg-white dark:bg-[#1E293B] transition-all duration-700 ${
          revisionIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar size={18} />
          Today's Revisions ({revisionLength})
        </h2>

        {revisions.length > 0 ? (
          revisions.map((r) => (
            <div
              key={r.revisionScheduleId}
              className="p-3 mb-2 rounded-lg bg-gray-100 dark:bg-[#0F172A] flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-gray-500">
                  {r.subject} • Day {r.dayNumber}
                </p>
              </div>
              <button
                onClick={() => navigate("/app/revisions")}
                className="px-3 py-1.5 rounded-full bg-amber-300 text-sm"
              >
                Go
              </button>
            </div>
          ))
        ) : (
          <p>No revisions today</p>
        )}
      </div>

      {/* TODAY Learnings */}
      <div
        className={`p-4 relative rounded-2xl bg-white dark:bg-[#1E293B] transition-all duration-700 ${
          topicsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div>
          <h2 className="text-2xl font-averaiserif mb-3 flex items-center gap-2">
            <BookOpen size={18} />
            Today’s Learnings ({todayTopics.length})
          </h2>
          <button
            onClick={() => {
              setEditingTopic(null);
              setShowModal(true);
            }}
            className="hidden sm:flex absolute top-2 right-3 items-center gap-2 bg-amber-300 px-4 py-2 rounded-full shadow"
          >
            <Plus size={16} />
            Add Topic
          </button>
        </div>
        {todayTopics.length > 0 ? (
          todayTopics.map((t) => (
            <div
              key={t.id}
              className="p-4 mb-3 rounded-2xl bg-gray-100 dark:bg-[#0F172A]"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.subject}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTopic(t);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 rounded-full text-xs bg-blue-500 text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this topic permanently?"))
                        return;

                      try {
                        await apiFetch(`/api/topics/${t.id}`, {
                          method: "DELETE",
                        });

                        toast.success("Topic deleted");
                        loadDashboard();
                      } catch (err) {
                        toast.error("Failed to delete topic");
                      }
                    }}
                    className="px-3 py-1 rounded-full text-xs bg-red-500 text-white"
                  >
                    Delete
                  </button>

                  <button
                    onClick={async () => {
                      setExpandedTopicId(t.id);

                      if (t.revisionPlanId) {
                        try {
                          const plan = await apiFetch(
                            `/api/admin/revision-plans/${t.revisionPlanId}`,
                          );
                          setRevisionPlanDetails(plan);
                        } catch {
                          setRevisionPlanDetails(null);
                        }
                      } else {
                        setRevisionPlanDetails(null);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center"
                  >
                    ⋯
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No topics added today</p>
        )}
      </div>

      {showModal && (
        <AddTopicForm
          closeModal={() => setShowModal(false)}
          editingTopic={editingTopic}
          refreshTopics={loadDashboard}
        />
      )}
      {expandedTopicId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="w-[90%] max-w-md rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-averaiserif font-bold">
                Topic Details
              </h2>

              <button
                onClick={() => {
                  setExpandedTopicId(null);
                  setRevisionPlanDetails(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#0F172A]"
              >
                ✕
              </button>
            </div>

            {(() => {
              const topic = todayTopics.find((x) => x.id === expandedTopicId);
              if (!topic) return <p>Topic not found</p>;

              return (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Title</p>
                    <p className="font-semibold">{topic.title}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Subject</p>
                    <p>{topic.subject}</p>
                  </div>

                  {topic.notes && (
                    <div>
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm">{topic.notes}</p>
                    </div>
                  )}

                  {revisionPlanDetails && (
                    <div>
                      <p className="text-xs text-gray-500">Revision Plan</p>
                      <p>{revisionPlanDetails.name}</p>
                      <p className="text-sm text-gray-500">
                        {revisionPlanDetails.revisionDaysPattern}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
