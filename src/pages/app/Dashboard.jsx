import React, { useEffect, useState, useContext } from "react";
import AddTopicForm from "../models/AddTopicForm";
import { ThemeContext } from "../../context/ThemeContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import toast from "react-hot-toast";
import { apiFetch } from "../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import { Plus, Flame, Calendar, BookOpen } from "lucide-react";
import ConfirmModal from "../../components/app_components/common/ConfirmModal";

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
  const [hoveredDay, setHoveredDay] = useState(null);
  const [heroIn, setHeroIn] = useState(false);
  const [revisionIn, setRevisionIn] = useState(false);
  const [topicsIn, setTopicsIn] = useState(false);
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [revisionPlanDetails, setRevisionPlanDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

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
    } catch {
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
    } catch {
      toast.error("Failed to load dashboard");
    }
  };
  const handleDeleteTopic = async () => {
    if (!selectedTopic) return;

    try {
      await apiFetch(`/api/topics/${selectedTopic.id}`, {
        method: "DELETE",
      });

      toast.success("Topic deleted");
      setShowDeleteConfirm(false);
      setSelectedTopic(null);

      if (expandedTopicId === selectedTopic.id) {
        setExpandedTopicId(null);
        setRevisionPlanDetails(null);
      }

      await loadDashboard();
    } catch {
      toast.error("Failed to delete topic");
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
    <div className="min-h-screen w-full rounded-2xl bg-gray-200 dark:bg-[#0F172A] text-black dark:text-white p-3 sm:p-5 lg:p-6 xl:p-8 space-y-4 sm:space-y-6  mx-auto">
      <div
        className={`p-4 sm:p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#1E293B] space-y-5 transition-all duration-700 ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-averaiserif font-bold leading-tight">
            Hey {user?.fullName || "User"} 👋
          </h1>
          <p className="font-averaiserif text-sm sm:text-base">
            Welcome to Prostriver!
          </p>
          <p className="font-averaiserif text-sm sm:text-base">
            What do you want to learn today?
          </p>
        </div>

        <div className="rounded-2xl relative bg-gray-100 dark:bg-[#0F172A] p-4 sm:p-5">
          <div className="absolute top-3 right-3 sm:right-5">
            <div className="rounded-full bg-amber-300 text-black px-3 sm:px-4 h-10 flex items-center gap-2 justify-center shrink-0">
              <Flame size={22} />
              <h2 className="text-xl sm:text-2xl font-averaiserif font-bold">
                {analytics?.challenge?.currentStreak || 0}
              </h2>
            </div>
          </div>

          <div className="pr-20 sm:pr-24">
            <p className="text-sm text-gray-500 font-averaiserif">
              Challenge Progress
            </p>
            <h3 className="text-2xl font-bold font-averaiserif">{progress}%</h3>
            <div className="w-full h-4 rounded-full bg-gray-300 dark:bg-[#1E293B] overflow-hidden mt-3">
              <div
                className="h-full rounded-full bg-amber-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 font-averaiserif">
              Weekly Activity
            </h3>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {(weekData.length
                ? weekData
                : Array(7).fill({ count: 0, label: "" })
              ).map((day, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredDay(index)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex flex-col items-center min-w-0"
                >
                  <div
                    className={`text-[10px] sm:text-xs font-averaiserif h-5 mb-1 transition-all duration-300 text-center ${hoveredDay === index ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
                  >
                    {`Topics: ${day.count}`}
                  </div>
                  <div
                    className={`w-full h-4 sm:h-5 rounded-full cursor-pointer transition-all duration-300 ${hoveredDay === index ? "-translate-y-1 shadow-md" : ""}`}
                    style={{ backgroundColor: getColor(day.count) }}
                  />
                  <p className="text-[10px] mt-1 text-gray-500 font-averaiserif">
                    {day.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] transition-all duration-700 ${revisionIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      >
        <h2 className="text-lg sm:text-xl font-averaiserif font-semibold mb-3 flex items-center gap-2">
          <Calendar size={18} /> Today's Revisions ({revisionLength})
        </h2>

        {revisions.length > 0 ? (
          revisions.map((r) => (
            <div
              key={r.revisionScheduleId}
              className="p-3 mb-2 rounded-lg bg-gray-100 dark:bg-[#0F172A] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold font-averaiserif truncate">
                  {r.title}
                </p>
                <p className="text-xs text-gray-500 font-averaiserif">
                  {r.subject} • Day {r.dayNumber}
                </p>
              </div>
              <button
                onClick={() => navigate("/app/revisions")}
                className="px-3 py-1.5 rounded-full bg-amber-300 text-sm w-full sm:w-auto"
              >
                Go
              </button>
            </div>
          ))
        ) : (
          <p className="font-averaiserif">No revisions today</p>
        )}
      </div>

      <div
        className={`p-4 sm:p-5 relative rounded-2xl bg-white dark:bg-[#1E293B] transition-all duration-700 ${topicsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-xl sm:text-2xl font-averaiserif flex items-center gap-2">
            <BookOpen size={18} /> Today’s Learnings ({todayTopics.length})
          </h2>
          <button
            onClick={() => {
              setEditingTopic(null);
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-amber-300 text-black px-4 py-2 rounded-full shadow font-averaiserif font-bold w-full sm:w-auto"
          >
            <Plus size={16} /> Add Topic
          </button>
        </div>

        {todayTopics.length > 0 ? (
          todayTopics.map((t) => (
            <div
              key={t.id}
              className="p-4 mb-3 rounded-2xl bg-gray-100 dark:bg-[#0F172A]"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="min-w-0">
                  <p className="font-semibold font-averaiserif break-words">
                    {t.title}
                  </p>
                  <p className="text-xs text-gray-500 font-averaiserif">
                    {t.subject}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                    onClick={() => {
                      setSelectedTopic(t);
                      setShowDeleteConfirm(true);
                    }}
                    className="px-3 py-1 rounded-full text-xs bg-red-500 text-white"
                  >
                    Delete
                  </button>
                  <button
                    onClick={async () => {
                      setExpandedTopicId(t.id);

                      const planId =
                        t.revisionPlanId || t.planId || t.revisionPlan?.id;

                      if (planId) {
                        try {
                          const plan = await apiFetch(
                            `/api/topics/revisions/get-by-id/${planId}`,
                          );
                          setRevisionPlanDetails(plan);
                        } catch {
                          setRevisionPlanDetails(null);
                        }
                      } else {
                        setRevisionPlanDetails({
                          revisionDaysPattern:
                            t.manualReminderPattern ||
                            t.customRevisionDays ||
                            t.revisionDaysPattern ||
                            "Custom plan",
                        });
                      }
                    }}
                    className="px-3 py-1 rounded-full text-xs bg-white dark:bg-[#1E293B] font-averaiserif"
                  >
                    view more
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="font-averaiserif">No topics added today</p>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-averaiserif font-bold">
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

                  <div className="rounded-2xl bg-gray-100 dark:bg-[#0F172A] p-4">
                    <p className="text-xs text-gray-500 mb-2">Revision Plan</p>
                    <p className="text-sm text-amber-400">
                      {revisionPlanDetails?.revisionDaysPattern ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Topic?"
        message="This topic will be permanently deleted."
        confirmText="Delete"
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedTopic(null);
        }}
        onConfirm={handleDeleteTopic}
      />
    </div>
  );
}
