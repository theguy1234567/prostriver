import React, { useContext, useEffect, useState } from "react";

import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  ListChecks,
  Trash2,
  BarChart3,
} from "lucide-react";

import { ThemeContext } from "../../context/ThemeContext";

/*
============================================================
CIRCULAR PROGRESS
============================================================
*/

function CircularProgress({
  percentage = 0,
  completed = 0,
  total = 0,
  size = 126,
}) {
  const strokeWidth = 8;

  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;

  const safePercentage = Math.min(100, Math.max(0, Number(percentage) || 0));

  const offset = circumference - (safePercentage / 100) * circumference;

  const isComplete = total > 0 && completed >= total;

  return (
    <div
      className="
        relative
        flex
        shrink-0
        items-center
        justify-center
      "
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background ring */}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="
            text-slate-200
            dark:text-slate-700
          "
        />

        {/* Progress ring */}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isComplete ? 0 : offset}
          className={
            isComplete
              ? `
                text-blue-500
                transition-all
                duration-700
              `
              : `
                text-amber-400
                transition-all
                duration-700
              `
          }
        />
      </svg>

      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
          text-center
        "
      >
        {isComplete ? (
          <>
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-blue-500
                text-white
              "
            >
              <Check size={18} strokeWidth={3} />
            </div>

            <span
              className="
                mt-1
                font-sans
                text-[11px]
                font-medium
                text-slate-500
                dark:text-slate-400
              "
            >
              Complete
            </span>
          </>
        ) : (
          <>
            <span
              className="
                font-sans
                text-2xl
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              {safePercentage}%
            </span>

            <span
              className="
                mt-0.5
                font-sans
                text-[11px]
                text-slate-500
                dark:text-slate-400
              "
            >
              {completed} of {total}
            </span>

            <span
              className="
                font-sans
                text-[10px]
                text-slate-400
                dark:text-slate-500
              "
            >
              tasks
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/*
============================================================
METADATA ITEM
============================================================
*/

function MetadataItem({ icon: Icon, children }) {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5
      "
    >
      <Icon
        size={15}
        strokeWidth={1.8}
        className="
          text-slate-400
          dark:text-slate-500
        "
      />

      <span>{children}</span>
    </div>
  );
}

/*
============================================================
STUDY PLAN CARD
============================================================
*/

export default function StudyPlanCard({ plan, onOpen, onDelete }) {
  const { dark } = useContext(ThemeContext);

  /*
  ==========================================================
  SAME FADE-IN AS ANALYTICS
  ==========================================================
  */

  const [performanceIn, setPerformanceIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPerformanceIn(true), 120);

    return () => clearTimeout(timer);
  }, []);

  const total = Number(plan?.totalSubtopics || 0);

  const completed = Number(plan?.completedSubtopics || 0);

  const started = Boolean(plan?.startPreparation);

  const status = plan?.status || "QUEUED";

  const percentage =
    started && total > 0
      ? Math.min(100, Math.round((completed / total) * 100))
      : 0;

  const isComplete = started && total > 0 && completed >= total;

  const title =
    plan?.plan?.goalOverview?.topic || plan?.input?.topic || "Study Plan";

  const level =
    plan?.input?.level ||
    plan?.plan?.goalOverview?.currentLevel ||
    "Intermediate";

  const time =
    plan?.input?.timeAvailable ||
    plan?.plan?.goalOverview?.totalTimeAvailable ||
    "Study plan";

  const description =
    plan?.plan?.goalOverview?.expectedOutcome ||
    plan?.plan?.goalOverview?.overview ||
    "";

  /*
  ==========================================================
  STATUS
  ==========================================================
  */

  const statusLabel = isComplete
    ? "Completed"
    : started
      ? "In Progress"
      : status === "DONE"
        ? "Ready"
        : status === "PROCESSING"
          ? "Processing"
          : status === "FAILED"
            ? "Failed"
            : "Queued";

  /*
  ==========================================================
  STATUS STYLE
  ==========================================================
  */

  const statusClass = isComplete
    ? `
        border-blue-200
        bg-blue-50
        text-blue-600
        dark:border-blue-400/30
        dark:bg-blue-400/10
        dark:text-blue-300
      `
    : started
      ? `
          border-amber-200
          bg-amber-50
          text-amber-600
          dark:border-amber-300/40
          dark:bg-amber-300/10
          dark:text-amber-200
        `
      : status === "FAILED"
        ? `
            border-red-200
            bg-red-50
            text-red-500
            dark:border-red-400/30
            dark:bg-red-400/10
            dark:text-red-300
          `
        : `
            border-slate-200
            bg-slate-100
            text-slate-600
            dark:border-slate-600
            dark:bg-slate-800/70
            dark:text-slate-300
          `;

  /*
  ==========================================================
  ICON STYLE
  ==========================================================
  */

  const iconClass = isComplete
    ? `
        bg-blue-50
        text-blue-600
        dark:bg-blue-400/15
        dark:text-blue-300
      `
    : `
        bg-amber-100
        text-amber-500
        dark:bg-amber-300
        dark:text-slate-950
      `;

  /*
  ==========================================================
  ANALYTICS-STYLE ANIMATION
  ==========================================================
  */

  const animationClass = performanceIn
    ? `
      opacity-100
      translate-y-0
    `
    : `
      opacity-0
      translate-y-3
    `;

  return (
    <article
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-[26px]
        border
        border-slate-200
        bg-white
        shadow-sm

        transition-all
        duration-700

        ${animationClass}

        hover:-translate-y-[1px]
        hover:shadow-md

        dark:border-slate-700/70
        dark:bg-[#1D2A3E]
        dark:hover:bg-[#202F45]
      `}
    >
      <button
        type="button"
        onClick={() => onOpen(plan)}
        className="
          w-full
          text-left
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-amber-400
          focus-visible:ring-inset
        "
      >
        <div
          className="
            flex
            min-h-[180px]
            items-center
            gap-5
            p-5
            sm:p-6
            lg:p-7
          "
        >
          {/* ==================================================
              DESKTOP ICON
          ================================================== */}

          <div
            className={`
              hidden
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-2xl
              sm:flex
              lg:h-[72px]
              lg:w-[72px]
              ${iconClass}
            `}
          >
            {isComplete ? (
              <Check size={30} strokeWidth={2.5} />
            ) : (
              <BookOpen size={29} strokeWidth={1.9} />
            )}
          </div>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div className="min-w-0 flex-1">
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              {/* Mobile icon */}

              <div
                className={`
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  sm:hidden
                  ${iconClass}
                `}
              >
                {isComplete ? (
                  <Check size={22} strokeWidth={2.5} />
                ) : (
                  <BookOpen size={21} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  className="
                    font-averaiserif
                    text-xl
                    font-bold
                    leading-tight
                    tracking-tight
                    text-slate-900
                    sm:text-2xl
                    lg:text-[26px]
                    dark:text-white
                  "
                >
                  {title}
                </h2>

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-x-4
                    gap-y-2
                    font-sans
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  <MetadataItem icon={ListChecks}>
                    {completed}/{total} tasks
                  </MetadataItem>

                  <span
                    className="
                      hidden
                      text-slate-300
                      dark:text-slate-600
                      sm:inline
                    "
                  >
                    •
                  </span>

                  <MetadataItem icon={Clock3}>{time}</MetadataItem>

                  <span
                    className="
                      hidden
                      text-slate-300
                      dark:text-slate-600
                      sm:inline
                    "
                  >
                    •
                  </span>

                  <MetadataItem icon={BarChart3}>{level}</MetadataItem>
                </div>
              </div>
            </div>

            {/* Description */}

            {description && (
              <p
                className="
                  mt-4
                  hidden
                  max-w-3xl
                  font-sans
                  text-sm
                  leading-6
                  text-slate-500
                  md:block
                  lg:text-[15px]
                  dark:text-slate-400
                "
              >
                {description}
              </p>
            )}

            {/* Status */}

            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className={`
                  inline-flex
                  items-center
                  rounded-md
                  border
                  px-2.5
                  py-1
                  font-sans
                  text-xs
                  font-medium
                  ${statusClass}
                `}
              >
                {statusLabel}
              </span>

              {started && !isComplete && (
                <span
                  className="
                      font-sans
                      text-xs
                      text-slate-400
                      dark:text-slate-500
                    "
                >
                  Resume your plan
                </span>
              )}
            </div>
          </div>

          {/* ==================================================
              CIRCULAR PROGRESS
          ================================================== */}

          <div
            className="
              hidden
              items-center
              gap-5
              md:flex
            "
          >
            <div
              className="
                h-24
                w-px
                bg-slate-200
                dark:bg-slate-700/70
              "
            />

            <CircularProgress
              percentage={percentage}
              completed={completed}
              total={total}
            />

            <ArrowRight
              size={25}
              strokeWidth={1.8}
              className="
                text-slate-400
                transition-transform
                duration-300
                group-hover:translate-x-1
                dark:text-slate-300
              "
            />
          </div>
        </div>

        {/* ==================================================
            MOBILE FOOTER
        ================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-200
            px-5
            py-3
            md:hidden
            dark:border-slate-700/60
          "
        >
          <span
            className="
              font-sans
              text-xs
              text-slate-500
              dark:text-slate-500
            "
          >
            {isComplete
              ? "Plan completed"
              : started
                ? "Resume your plan"
                : "Open study plan"}
          </span>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                font-sans
                text-xs
                font-medium
                text-slate-600
                dark:text-slate-300
              "
            >
              {percentage}%
            </span>

            <ArrowRight size={17} className="text-slate-400" />
          </div>
        </div>
      </button>

      {/* ======================================================
          DELETE
      ====================================================== */}

      <button
        type="button"
        title="Delete study plan"
        aria-label="Delete study plan"
        onClick={(event) => {
          event.stopPropagation();

          onDelete(event, plan?.jobId);
        }}
        className="
          absolute
          right-4
          top-4
          z-10
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          text-slate-400
          opacity-0
          transition-all
          hover:bg-red-50
          hover:text-red-500
          group-hover:opacity-100
          focus:opacity-100
          dark:text-slate-500
          dark:hover:bg-red-400/10
          dark:hover:text-red-400
        "
      >
        <Trash2 size={15} />
      </button>
    </article>
  );
}
