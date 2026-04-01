import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Flame,
  Percent,
  Calendar,
  Trophy,
  Target,
  TimerReset,
} from "lucide-react";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [revisions, setRevisions] = useState([]);

  // ✅ staggered animation states
  const [performanceIn, setPerformanceIn] = useState(false);
  const [challengeIn, setChallengeIn] = useState(false);
  const [timelineIn, setTimelineIn] = useState(false);

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
    const timer2 = setTimeout(() => setChallengeIn(true), 320);
    const timer3 = setTimeout(() => setTimelineIn(true), 520);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const revisionRate = Math.round((analytics?.revision?.rateMtd ?? 0) * 100);

  const challengeProgress = Math.round(
    analytics?.challenge?.progressPercent ?? 0,
  );

  const challengeCompletion = Math.round(
    (analytics?.challenge?.completionRate ?? 0) * 100,
  );

  return (
    <div className="p-3 sm:p-6 min-h-screen bg-gray-200 dark:bg-[#0F172A] text-black dark:text-white">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 auto-rows-auto">
        {/* PERFORMANCE */}
        <div
          className={`rounded-3xl bg-white dark:bg-[#1E293B] p-5 sm:p-6 shadow-sm transition-all duration-700 ${
            performanceIn
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold font-averaiserif mb-6">
            Your Performance
          </h1>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
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
              label="Pending"
              value={revisions.length}
              icon={<Calendar size={18} />}
            />
            <Stat
              label="Revision Rate"
              value={`${revisionRate}%`}
              icon={<Percent size={18} />}
            />
            <div className="col-span-2">
              <Stat
                label="Current Streak"
                value={analytics?.challenge?.currentStreak}
                icon={<Flame size={18} />}
              />
            </div>
          </div>
        </div>

        {/* CHALLENGE PERFORMANCE */}
        <div
          className={`rounded-3xl bg-white dark:bg-[#1E293B] p-5 sm:p-6 shadow-sm transition-all duration-700 ${
            challengeIn
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          <div className="flex items-center gap-2 mb-6">
            <Trophy size={18} />
            <h2 className="text-2xl font-bold font-averaiserif">
              Challenge Performance
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <ProgressRing progress={challengeProgress} />

            <div className="grid grid-cols-2 gap-4 w-full">
              <MiniStat
                label="Completion"
                value={`${challengeCompletion}%`}
                icon={<Percent size={16} />}
              />
              <MiniStat
                label="Freeze Left"
                value={analytics?.challenge?.freezeRemaining || 0}
                icon={<TimerReset size={16} />}
              />
              <MiniStat
                label="Completed Days"
                value={analytics?.challenge?.qualifiedDays || 0}
                icon={<Calendar size={16} />}
              />
              <MiniStat
                label="Progress"
                value={`${challengeProgress}%`}
                icon={<Target size={16} />}
              />
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div
          className={`xl:col-span-2 rounded-3xl bg-white dark:bg-[#1E293B] p-5 sm:p-6 shadow-sm transition-all duration-700 ${
            timelineIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <h2 className="text-2xl font-bold font-averaiserif mb-6">
            Challenge Timeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimelineRow
              label="Type"
              value={analytics?.challenge?.type || "—"}
            />
            <TimelineRow
              label="Duration"
              value={`${analytics?.challenge?.durationDays || 0} days`}
            />
            <TimelineRow
              label="Start"
              value={analytics?.challenge?.startDate || "—"}
            />
            <TimelineRow
              label="End"
              value={analytics?.challenge?.endDate || "—"}
            />
          </div>
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
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <p className="text-sm">{label}</p>
      </div>
      <h2 className="text-3xl font-bold font-averaiserif">{value || 0}</h2>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-gray-100 dark:bg-[#0F172A] shadow-sm">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <p className="text-sm">{label}</p>
      </div>
      <h3 className="text-2xl font-bold font-averaiserif">{value}</h3>
    </div>
  );
}

function TimelineRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-100 dark:bg-[#0F172A] shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold font-averaiserif">{value}</p>
    </div>
  );
}
