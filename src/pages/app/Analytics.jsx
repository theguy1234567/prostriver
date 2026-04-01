import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Flame,
  Percent,
  Calendar,
  Rocket,
} from "lucide-react";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [performanceIn, setPerformanceIn] = useState(false);

  const loadAnalytics = async () => {
    try {
      const [analyticsData, revData] = await Promise.all([
        apiFetch("/api/analytics/overview"),
        apiFetch("/api/topics/revisions/today"),
      ]);

      setAnalytics(analyticsData);
      setRevisions(revData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics");
    }
  };

  useEffect(() => {
    loadAnalytics();

    const timer1 = setTimeout(() => setPerformanceIn(true), 120);

    return () => clearTimeout(timer1);
  }, []);

  const revisionRate = Math.round((analytics?.revision?.rateMtd ?? 0) * 100);

  const hasAnalyticsData =
    (analytics?.revision?.completedMtd ?? 0) > 0 ||
    (analytics?.revision?.missedMtd ?? 0) > 0 ||
    revisions.length > 0 ||
    (analytics?.challenge?.currentStreak ?? 0) > 0;

  return (
    <div className="p-3 sm:p-6 min-h-screen bg-gray-200 dark:bg-[#0F172A] text-black dark:text-white">
      <div className="grid grid-cols-1 w-full xl:grid-cols-1 gap-4 auto-rows-auto">
        <div
          className={`relative rounded-3xl bg-white dark:bg-[#1E293B] p-5 sm:p-6 shadow-sm transition-all duration-700 ${
            performanceIn
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold font-averaiserif mb-2">
            Your Performance
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Monthly revision insights based on completed, missed and pending
            reviews
          </p>

          {/* analytics stays visible */}
          <div
            className={`transition-all duration-500 ${
              !hasAnalyticsData ? "blur-md select-none" : ""
            }`}
          >
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
              <Stat
                label="Completed This Month"
                value={analytics?.revision?.completedMtd}
                icon={<CheckCircle size={18} />}
              />
              <Stat
                label="Missed This Month"
                value={analytics?.revision?.missedMtd}
                icon={<XCircle size={18} />}
              />
              <Stat
                label="Pending Today"
                value={revisions.length}
                icon={<Calendar size={18} />}
              />
              <Stat
                label="Current Streak"
                value={analytics?.challenge?.currentStreak}
                icon={<Flame size={18} />}
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Percent size={16} />
                  <span>Revision Success Rate</span>
                </div>
                <span className="font-semibold">{revisionRate}%</span>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#0F172A] p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Percent size={16} />
                  <span>Revision Success Rate</span>
                </div>

                <ProgressRing progress={revisionRate} />

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  Based on completed vs missed revisions this month
                </p>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Based on completed vs missed revisions this month
              </p>
            </div>
          </div>

          {/* better honest empty state */}
          {!hasAnalyticsData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
              <div className="mb-5 w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-400/10 flex items-center justify-center">
                <Rocket size={34} className="text-amber-500" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-averaiserif mb-3 text-center">
                Your analytics will appear here
              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center max-w-lg leading-relaxed">
                Once you start making progress in your challenge, your streaks,
                revision success rate, completed reviews, and learning insights
                will begin to appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ progress }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-300 dark:text-[#0F172A]"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeLinecap="round"
            className="text-amber-300 transition-all duration-700"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold font-averaiserif">{progress}%</p>
          <p className="text-xs text-gray-500">Progress</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="p-5 rounded-2xl bg-gray-100 dark:bg-[#0F172A] shadow-sm">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
        {icon}
        <p className="text-sm">{label}</p>
      </div>
      <h2 className="text-3xl font-bold font-averaiserif">{value || 0}</h2>
    </div>
  );
}
