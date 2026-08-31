import React, { useContext, useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  LoaderCircle,
  Lock,
  Plus,
  XCircle,
  Globe,
  Play,
} from "lucide-react";

import { apiFetch } from "../../utils/apiFetch";
import { ThemeContext } from "../../context/ThemeContext";
import StudyPlanCard from "../../components/app_components/StudyPlanCard";

const EMPTY_FORM = {
  topic: "",
  timeAvailable: "",
  purpose: "",
  level: "Beginner",
  notes: "",
};

/* ============================================================
   STATUS COPY
============================================================ */

const STATUS_COPY = {
  QUEUED: {
    label: "Queued",
    title: "Getting things ready",
    description: "Your study plan is in the queue and will start shortly.",
  },

  PROCESSING: {
    label: "Processing",
    title: "Building your study plan",
    description:
      "We're gathering materials and organizing everything around your goal.",
  },

  DONE: {
    label: "Ready",
    title: "Your plan is ready",
    description:
      "Everything has been organized into your personalized roadmap.",
  },

  FAILED: {
    label: "Failed",
    title: "Something went wrong",
    description: "We couldn't finish generating your study plan.",
  },
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function StudyPlan() {
  useContext(ThemeContext);

  const [performanceIn, setPerformanceIn] = useState(false);

  const [page, setPage] = useState("list");

  const [plans, setPlans] = useState([]);

  const [selectedPlan, setSelectedPlan] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [jobId, setJobId] = useState("");

  const [jobStatus, setJobStatus] = useState("");

  const [plan, setPlan] = useState(null);

  const [progress, setProgress] = useState({
    startPreparation: false,
    totalSubtopics: 0,
    completedSubtopics: 0,
  });

  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [retryAfter, setRetryAfter] = useState(0);

  /* ============================================================
     PAGE ANIMATION
  ============================================================ */

  useEffect(() => {
    const timer = setTimeout(() => setPerformanceIn(true), 120);

    return () => clearTimeout(timer);
  }, []);

  /* ============================================================
     LOAD PLANS
  ============================================================ */

  const loadPlans = async () => {
    setIsLoadingPlans(true);
    setError("");

    try {
      const response = await apiFetch("/api/study-plan");

      let summaries = [];

      if (Array.isArray(response)) {
        summaries = response;
      } else if (Array.isArray(response?.plans)) {
        summaries = response.plans;
      } else if (Array.isArray(response?.jobIds)) {
        const results = await Promise.allSettled(
          response.jobIds.map((id) => apiFetch(`/api/study-plan/${id}`)),
        );

        summaries = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
      }

      setPlans(summaries);
    } catch (requestError) {
      setError(requestError?.message || "We couldn't load your study plans.");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  /* ============================================================
     RATE LIMIT TIMER
  ============================================================ */

  useEffect(() => {
    if (retryAfter <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRetryAfter((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  /* ============================================================
     FORM
  ============================================================ */

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ============================================================
     CREATE PLAN
  ============================================================ */

  const handleGeneratePlan = async () => {
    const topic = form.topic.trim();
    const timeAvailable = form.timeAvailable.trim();
    const purpose = form.purpose.trim();

    if (!topic || !timeAvailable || !purpose) {
      setError("Topic, time available, and purpose are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    setRetryAfter(0);

    try {
      const response = await apiFetch("/api/study-plan", {
        method: "POST",
        body: {
          topic,
          timeAvailable,
          purpose,
          level: form.level,
          notes: form.notes.trim(),
        },
      });

      const nextJobId = response?.jobId;

      if (!nextJobId) {
        throw new Error("No job ID was returned by the server.");
      }

      setJobId(nextJobId);
      setJobStatus("QUEUED");
      setPlan(null);

      setProgress({
        startPreparation: false,
        totalSubtopics: 0,
        completedSubtopics: 0,
      });

      setPage("detail");
    } catch (requestError) {
      if (requestError?.status === 429) {
        const seconds = Number(requestError?.data?.retryAfterSeconds || 60);

        setRetryAfter(Math.max(1, seconds));

        setError(
          `Too many requests. Please wait ${Math.max(1, seconds)} seconds.`,
        );
      } else {
        setError(
          requestError?.message || "We couldn't create your study plan.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     POLLING
  ============================================================ */

  useEffect(() => {
    if (
      page !== "detail" ||
      !jobId ||
      !jobStatus ||
      jobStatus === "DONE" ||
      jobStatus === "FAILED"
    ) {
      return;
    }

    let cancelled = false;
    let timeoutId;

    const pollJob = async () => {
      try {
        const response = await apiFetch(`/api/study-plan/${jobId}`);

        if (cancelled) {
          return;
        }

        const nextStatus = response?.status || "QUEUED";

        setJobStatus(nextStatus);

        setProgress({
          startPreparation: Boolean(response?.startPreparation),

          totalSubtopics: Number(response?.totalSubtopics || 0),

          completedSubtopics: Number(response?.completedSubtopics || 0),
        });

        if (nextStatus === "DONE") {
          setPlan(response?.plan || null);

          setSelectedPlan(response);

          loadPlans();

          return;
        }

        if (nextStatus === "FAILED") {
          setError("Study plan generation failed.");
          return;
        }

        timeoutId = setTimeout(pollJob, 3000);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError?.message || "We couldn't reach the study plan service.",
        );

        setJobStatus("FAILED");
      }
    };

    pollJob();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [jobId, jobStatus, page]);

  /* ============================================================
     OPEN PLAN
  ============================================================ */

  const handleOpenPlan = async (existingPlan) => {
    const selectedJobId = existingPlan?.jobId;

    if (!selectedJobId) {
      return;
    }

    setError("");
    setIsLoadingPlan(true);
    setJobId(selectedJobId);
    setPage("detail");

    try {
      const response = await apiFetch(`/api/study-plan/${selectedJobId}`);

      const nextStatus = response?.status || "QUEUED";

      setJobStatus(nextStatus);

      setSelectedPlan(response);

      setProgress({
        startPreparation: Boolean(response?.startPreparation),

        totalSubtopics: Number(response?.totalSubtopics || 0),

        completedSubtopics: Number(response?.completedSubtopics || 0),
      });

      if (nextStatus === "DONE") {
        setPlan(response?.plan || null);
      } else {
        setPlan(null);
      }
    } catch (requestError) {
      setError(requestError?.message || "We couldn't open this study plan.");
    } finally {
      setIsLoadingPlan(false);
    }
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDeletePlan = async (event, selectedJobId) => {
    event?.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this study plan?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiFetch(`/api/study-plan/${selectedJobId}`, {
        method: "DELETE",
      });

      setPlans((previous) =>
        previous.filter((item) => item?.jobId !== selectedJobId),
      );

      if (jobId === selectedJobId) {
        setPage("list");
        setPlan(null);
        setSelectedPlan(null);
        setJobId("");
        setJobStatus("");
      }
    } catch (requestError) {
      setError(requestError?.message || "We couldn't delete this study plan.");
    }
  };

  /* ============================================================
     START PREPARATION
  ============================================================ */

  const handleStartPreparation = async () => {
    if (!jobId) {
      return;
    }

    try {
      setError("");

      const response = await apiFetch(`/api/study-plan/${jobId}/start`, {
        method: "PATCH",
      });

      setProgress((previous) => ({
        ...previous,
        startPreparation: Boolean(response?.startPreparation),
      }));

      setPlans((previous) =>
        previous.map((item) =>
          item?.jobId === jobId
            ? {
                ...item,
                startPreparation: Boolean(response?.startPreparation),
              }
            : item,
        ),
      );
    } catch (requestError) {
      setError(requestError?.message || "We couldn't start your study plan.");
    }
  };

  /* ============================================================
     SUBTOPIC TOGGLE
  ============================================================ */

  const handleToggleSubtopic = async (subtopicId, doneValue) => {
    if (!progress.startPreparation || !jobId || !plan) {
      return;
    }

    const previousPlan = JSON.parse(JSON.stringify(plan));

    const nextPlan = JSON.parse(JSON.stringify(plan));

    for (const topic of nextPlan?.mainTopics || []) {
      for (const subtopic of topic.subTopics || []) {
        if (subtopic.subtopicId === subtopicId) {
          subtopic.done = Boolean(doneValue);
        }
      }
    }

    setPlan(nextPlan);

    let optimisticCompleted = 0;
    let optimisticTotal = 0;

    for (const topic of nextPlan?.mainTopics || []) {
      for (const subtopic of topic.subTopics || []) {
        optimisticTotal++;

        if (subtopic.done) {
          optimisticCompleted++;
        }
      }
    }

    setProgress((previous) => ({
      ...previous,
      completedSubtopics: optimisticCompleted,
      totalSubtopics: optimisticTotal || previous.totalSubtopics,
    }));

    try {
      const response = await apiFetch(
        `/api/study-plan/${jobId}/subtopic/${subtopicId}`,
        {
          method: "PATCH",
          body: {
            done: Boolean(doneValue),
          },
        },
      );

      setProgress({
        startPreparation: Boolean(response?.startPreparation),

        totalSubtopics: Number(
          response?.totalSubtopics || optimisticTotal || 0,
        ),

        completedSubtopics: Number(
          response?.completedSubtopics ?? optimisticCompleted,
        ),
      });

      setPlans((previous) =>
        previous.map((item) =>
          item?.jobId === jobId
            ? {
                ...item,

                startPreparation: Boolean(
                  response?.startPreparation ?? item?.startPreparation,
                ),

                completedSubtopics: Number(
                  response?.completedSubtopics ?? optimisticCompleted,
                ),

                totalSubtopics: Number(
                  response?.totalSubtopics || optimisticTotal || 0,
                ),
              }
            : item,
        ),
      );
    } catch (requestError) {
      setPlan(previousPlan);

      setError(requestError?.message || "Couldn't update the subtopic.");
    }
  };

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleBackToPlans = () => {
    setError("");

    setPage("list");

    setPlan(null);
    setJobId("");
    setJobStatus("");
    setSelectedPlan(null);

    loadPlans();
  };

  const handleNewPlan = () => {
    setForm(EMPTY_FORM);

    setError("");
    setRetryAfter(0);

    setPlan(null);
    setJobId("");
    setJobStatus("");
    setSelectedPlan(null);

    setProgress({
      startPreparation: false,
      totalSubtopics: 0,
      completedSubtopics: 0,
    });

    setPage("create");
  };

  /* ============================================================
     OVERALL PROGRESS
  ============================================================ */

  const progressPercent = useMemo(() => {
    if (!progress.startPreparation || !progress.totalSubtopics) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((progress.completedSubtopics / progress.totalSubtopics) * 100),
    );
  }, [progress]);

  /* ============================================================
     PAGE ANIMATION
  ============================================================ */

  const pageAnimation = `
    transition-all
    duration-700
    ${performanceIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
  `;

  return (
    <div
      className="
        min-h-screen
        w-full
        rounded-2xl
        bg-gray-200
        px-3
        py-4
        text-black
        sm:px-5
        sm:py-6
        lg:px-8
        lg:py-8
        xl:px-10
        xl:py-10
        dark:bg-[#0F172A]
        dark:text-white
      "
    >
      {/* ======================================================
          LIST PAGE
      ====================================================== */}

      {page === "list" && (
        <div
          className={`
            mx-auto
            w-full
            max-w-[1600px]
            ${pageAnimation}
          `}
        >
          <div
            className="
              mb-6
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <h1
                className="
                  font-averaiserif
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-4xl
                  lg:text-5xl
                  dark:text-white
                "
              >
                Your Study Plans
              </h1>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-500
                  sm:text-base
                  dark:text-slate-400
                "
              >
                Continue learning or create a new personalized plan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNewPlan}
              className="
                inline-flex
                w-fit
                items-center
                justify-center
                gap-2
                rounded-full
                bg-amber-300
                px-5
                py-3
                font-averaiserif
                font-bold
                text-slate-950
                
                
                transition-all
                hover:bg-amber-200
                active:scale-[0.98]
              "
            >
              <Plus size={19} strokeWidth={2.5} />
              New Plan
            </button>
          </div>

          {error && (
            <div
              className="
                mb-5
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
                dark:border-red-400/20
                dark:bg-red-400/10
                dark:text-red-300
              "
            >
              <XCircle size={18} className="shrink-0" />

              <span className="flex-1">{error}</span>

              <button onClick={loadPlans} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {isLoadingPlans && (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="
                    h-[190px]
                    animate-pulse
                    rounded-[26px]
                    bg-white
                    shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
                    dark:bg-[#1D2A3E]
                  "
                />
              ))}
            </div>
          )}

          {!isLoadingPlans && plans.length === 0 && !error && (
            <div
              className="
                  rounded-[26px]
                  border
                  border-slate-200
                  bg-white
                  px-6
                  py-16
                  text-center
                  shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
                  dark:border-slate-700/70
                  dark:bg-[#1D2A3E]
                "
            >
              <div
                className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-amber-300
                    text-slate-950
                  "
              >
                <BookOpen size={28} />
              </div>

              <h2
                className="
                    mt-5
                    font-averaiserif
                    text-2xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
              >
                No study plans yet
              </h2>

              <p
                className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
              >
                Create your first personalized learning roadmap.
              </p>

              <button
                onClick={handleNewPlan}
                className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-amber-300
                    px-5
                    py-3
                    font-averaiserif
                    font-bold
                    text-slate-950
                  "
              >
                <Plus size={18} />
                Create Plan
              </button>
            </div>
          )}

          {!isLoadingPlans && plans.length > 0 && (
            <div className="space-y-4">
              {plans.map((item, index) => (
                <div
                  key={item.jobId}
                  className={`
                      transition-all
                      duration-700
                      ${
                        performanceIn
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-3"
                      }
                    `}
                  style={{
                    transitionDelay: `${index * 70}ms`,
                  }}
                >
                  <StudyPlanCard
                    plan={item}
                    onOpen={handleOpenPlan}
                    onDelete={handleDeletePlan}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          CREATE PAGE
      ====================================================== */}

      {page === "create" && (
        <div className={pageAnimation}>
          <CreatePlan
            form={form}
            error={error}
            retryAfter={retryAfter}
            isSubmitting={isSubmitting}
            onChange={handleFieldChange}
            onSubmit={handleGeneratePlan}
            onBack={handleBackToPlans}
          />
        </div>
      )}

      {/* ======================================================
          DETAIL PAGE
      ====================================================== */}

      {page === "detail" && (
        <div
          className={`
            mx-auto
            w-full
            max-w-[1600px]
            ${pageAnimation}
          `}
        >
          <div
            className="
              mb-6
              flex
              items-center
              gap-3
              sm:mb-7
            "
          >
            <button
              onClick={handleBackToPlans}
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
                transition
                hover:bg-slate-50
                
                dark:border-slate-700
                dark:bg-[#1D2A3E]
                dark:text-slate-300
                dark:hover:bg-[#26364D]
              "
            >
              <ArrowLeft size={19} />
            </button>

            <div className="min-w-0">
              <p
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Study Plan
              </p>

              <h1
                className="
                  truncate
                  font-averaiserif
                  text-2xl
                  font-bold
                  leading-tight
                  text-slate-900
                  sm:text-3xl
                  lg:text-4xl
                  dark:text-white
                "
              >
                {selectedPlan?.input?.topic ||
                  plan?.goalOverview?.topic ||
                  "Your Study Plan"}
              </h1>
            </div>
          </div>

          {error && (
            <div
              className="
                mb-5
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-4
                text-sm
                text-red-600
                dark:border-red-400/20
                dark:bg-red-400/10
                dark:text-red-300
              "
            >
              {error}
            </div>
          )}

          {isLoadingPlan && (
            <GenerationStatus
              status="PROCESSING"
              description="Opening your study plan..."
            />
          )}

          {!isLoadingPlan &&
            (jobStatus === "QUEUED" || jobStatus === "PROCESSING") && (
              <GenerationStatus status={jobStatus} />
            )}

          {!isLoadingPlan && jobStatus === "DONE" && plan && (
            <StudyPlanContent
              plan={plan}
              progress={progress}
              progressPercent={progressPercent}
              onStartPreparation={handleStartPreparation}
              onToggleSubtopic={handleToggleSubtopic}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CREATE PLAN
============================================================ */

function CreatePlan({
  form,
  error,
  retryAfter,
  isSubmitting,
  onChange,
  onSubmit,
  onBack,
}) {
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onBack}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-600
            shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
            dark:border-slate-700
            dark:bg-[#1D2A3E]
            dark:text-slate-300
          "
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p
            className="
              text-xs
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            Study Planner
          </p>

          <h1
            className="
              font-averaiserif
              text-2xl
              font-bold
              text-slate-900
              sm:text-3xl
              dark:text-white
            "
          >
            Create a study plan
          </h1>
        </div>
      </div>

      <div
        className="
          rounded-[26px]
          border
          border-slate-200
          bg-white
          p-5
          shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
          sm:p-7
          dark:border-slate-700/70
          dark:bg-[#1D2A3E]
        "
      >
        <h2
          className="
            font-averaiserif
            text-2xl
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          What do you want to learn?
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
            dark:text-slate-400
          "
        >
          Tell us about your goal and we'll build your roadmap.
        </p>

        {error && (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-3
              text-sm
              text-red-600
              dark:border-red-400/20
              dark:bg-red-400/10
              dark:text-red-300
            "
          >
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <InputField
            label="Topic"
            name="topic"
            value={form.topic}
            onChange={onChange}
            placeholder="System Design"
          />

          <InputField
            label="Time Available"
            name="timeAvailable"
            value={form.timeAvailable}
            onChange={onChange}
            placeholder="2 weeks"
          />

          <InputField
            label="Purpose"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="SDE interview"
          />

          <label className="space-y-2">
            <span
              className="
                text-sm
                font-semibold
                text-slate-800
                dark:text-slate-200
              "
            >
              Current Level
            </span>

            <select
              name="level"
              value={form.level}
              onChange={onChange}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-slate-900
                outline-none
                focus:border-amber-300
                dark:border-slate-700
                dark:bg-[#0F1A2B]
                dark:text-white
              "
            >
              <option value="Beginner">Beginner</option>

              <option value="Intermediate">Intermediate</option>

              <option value="Expert">Expert</option>
            </select>
          </label>
        </div>

        <label className="mt-5 block space-y-2">
          <span
            className="
              text-sm
              font-semibold
              text-slate-800
              dark:text-slate-200
            "
          >
            Notes
          </span>

          <textarea
            name="notes"
            value={form.notes}
            onChange={onChange}
            rows={4}
            placeholder="Anything specific you want the plan to focus on?"
            className="
              w-full
              resize-none
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-4
              py-3
              text-slate-900
              outline-none
              placeholder:text-slate-400
              focus:border-amber-300
              dark:border-slate-700
              dark:bg-[#0F1A2B]
              dark:text-white
              dark:placeholder:text-slate-600
            "
          />
        </label>

        {retryAfter > 0 && (
          <p
            className="
              mt-4
              text-sm
              text-amber-600
              dark:text-amber-300
            "
          >
            Please wait {retryAfter}s before creating another plan.
          </p>
        )}

        <div
          className="
            mt-6
            flex
            flex-col-reverse
            gap-3
            sm:flex-row
            sm:justify-end
          "
        >
          <button
            onClick={onBack}
            className="
              rounded-full
              border
              border-slate-200
              bg-white
              px-5
              py-3
              font-averaiserif
              font-bold
              text-slate-600
              shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
              dark:border-slate-700
              dark:bg-[#1D2A3E]
              dark:text-slate-300
            "
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={isSubmitting || retryAfter > 0}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-full
              bg-amber-300
              px-6
              py-3
              font-averaiserif
              font-bold
              text-slate-950
              disabled:opacity-50
            "
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Generate Plan
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INPUT
============================================================ */

function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <label className="space-y-2">
      <span
        className="
          text-sm
          font-semibold
          text-slate-800
          dark:text-slate-200
        "
      >
        {label}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          px-4
          py-3
          text-slate-900
          outline-none
          placeholder:text-slate-400
          focus:border-amber-300
          dark:border-slate-700
          dark:bg-[#0F1A2B]
          dark:text-white
          dark:placeholder:text-slate-600
        "
      />
    </label>
  );
}

/* ============================================================
   GENERATION STATUS
============================================================ */

function GenerationStatus({ status, description }) {
  const copy = STATUS_COPY[status] || STATUS_COPY.PROCESSING;

  const processingStages = [
    {
      title: "Building your study plan",
      description: "We're organizing everything around your goal.",
    },

    {
      title: "Finalizing your roadmap",
      description: "We're refining topics, tasks, and resources for you.",
    },

    {
      title: "Almost there",
      description: "Putting the finishing touches on your personalized plan.",
    },
  ];

  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (status !== "PROCESSING" && status !== "QUEUED") {
      return;
    }

    const interval = setInterval(() => {
      setStage((current) => (current + 1) % processingStages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [status]);

  const currentStage = processingStages[stage];

  const title =
    status === "PROCESSING" || status === "QUEUED"
      ? currentStage.title
      : copy.title;

  const stageDescription =
    status === "PROCESSING" || status === "QUEUED"
      ? currentStage.description
      : description || copy.description;

  return (
    <div
      className="
        rounded-[26px]
        border
        border-slate-200
        bg-white
        px-6
        py-16
        text-center
        shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
        dark:border-slate-700/70
        dark:bg-[#1D2A3E]
      "
    >
      <div
        className="
          mx-auto
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-full
          bg-amber-300
          text-slate-950
        "
      >
        <LoaderCircle size={34} strokeWidth={1.8} className="animate-spin" />
      </div>

      <div
        className="
          mt-7
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-slate-200
          bg-slate-50
          px-3.5
          py-1.5
          dark:border-slate-700
          dark:bg-[#152236]
        "
      >
        <span
          className="
            h-2
            w-2
            animate-pulse
            rounded-full
            bg-amber-300
          "
        />

        <span
          className="
            text-xs
            font-medium
            uppercase
            tracking-wider
            text-slate-500
            dark:text-slate-400
          "
        >
          {copy.label}
        </span>
      </div>

      <div
        key={stage}
        className="
          mt-5
          transition-all
          duration-700
          opacity-100
          translate-y-0
        "
      >
        <h2
          className="
            font-averaiserif
            text-2xl
            font-bold
            text-slate-900
            sm:text-3xl
            dark:text-white
          "
        >
          {title}
        </h2>

        <p
          className="
            mx-auto
            mt-3
            max-w-xl
            text-sm
            leading-6
            text-slate-500
            sm:text-base
            dark:text-slate-400
          "
        >
          {stageDescription}
        </p>
      </div>

      <div className="mt-7 flex justify-center gap-1.5">
        {processingStages.map((_, index) => (
          <span
            key={index}
            className={`
                h-1.5
                rounded-full
                transition-all
                duration-500
                ${
                  index === stage
                    ? "w-6 bg-amber-300"
                    : "w-1.5 bg-slate-200 dark:bg-slate-700"
                }
              `}
          />
        ))}
      </div>

      <p
        className="
          mt-7
          text-xs
          text-slate-400
          dark:text-slate-600
        "
      >
        This page updates automatically.
      </p>
    </div>
  );
}

/* ============================================================
   STUDY PLAN CONTENT
============================================================ */

function StudyPlanContent({
  plan,
  progress,
  progressPercent,
  onStartPreparation,
  onToggleSubtopic,
}) {
  const started = Boolean(progress.startPreparation);

  const completed =
    started &&
    progress.totalSubtopics > 0 &&
    progress.completedSubtopics >= progress.totalSubtopics;

  const expectedOutcomes = getExpectedOutcomes(plan);

  const mainTopics = Array.isArray(plan?.mainTopics) ? plan.mainTopics : [];

  // The first unfinished topic is the single active step on the
  // main roadmap thread. This is derived from the backend's
  // subtopic `done` state; no new backend field is required.
  const activeTopicIndex = started
    ? mainTopics.findIndex((topic) => {
        const subtopics = Array.isArray(topic?.subTopics)
          ? topic.subTopics
          : [];

        return (
          subtopics.length === 0 ||
          subtopics.some((subtopic) => !Boolean(subtopic?.done))
        );
      })
    : -1;

  return (
    <div
      className="
        transition-all
        duration-700
        opacity-100
        translate-y-0
      "
    >
      {/* ======================================================
          PLAN HERO
      ====================================================== */}

      <section
        className="
          rounded-[30px]
          border
          border-slate-200
          bg-white
          p-5
          shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
          sm:p-7
          lg:p-9
          dark:border-slate-700/70
          dark:bg-[#1D2A3E]
        "
      >
        <div
          className="
            relative
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-5xl">
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-amber-600
                dark:text-amber-300
              "
            >
              Your learning plan
            </p>

            <h2
              className="
                mt-2
                font-averaiserif
                text-3xl
                font-bold
                leading-[1.08]
                tracking-tight
                text-slate-900
                sm:text-4xl
                lg:text-5xl
                dark:text-white
              "
            >
              {plan?.goalOverview?.topic || "Your Study Plan"}
            </h2>

            {plan?.goalOverview?.description && (
              <p
                className="
                  mt-4
                  max-w-4xl
                  text-sm
                  leading-7
                  text-slate-500
                  sm:text-base
                  dark:text-slate-400
                "
              >
                {plan.goalOverview.description}
              </p>
            )}
          </div>
        </div>

        {/* ====================================================
            META
        ==================================================== */}

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <DetailStat
            label="Total time"
            value={plan?.goalOverview?.totalTimeAvailable || "N/A"}
          />

          <DetailStat
            label="Daily study"
            value={plan?.goalOverview?.recommendedDailyStudyTime || "N/A"}
          />

          <DetailStat
            label="Level"
            value={plan?.goalOverview?.currentLevel || "N/A"}
          />
        </div>

        {/* ====================================================
            PROGRESS
        ==================================================== */}

        {started && (
          <div
            className="
              mt-5
              rounded-2xl
              bg-slate-50
              p-4
              sm:p-5
              dark:bg-[#132035]
            "
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-slate-400
                  "
                >
                  Plan progress
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-slate-700
                    dark:text-slate-200
                  "
                >
                  {progress.completedSubtopics} of {progress.totalSubtopics}{" "}
                  learning steps completed
                </p>
              </div>

              <span
                className="
                  text-sm
                  font-semibold
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {progressPercent}%
              </span>
            </div>

            <div
              className="
                mt-3
                h-2.5
                overflow-hidden
                rounded-full
                bg-slate-200
                dark:bg-slate-700
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-amber-300
                  transition-all
                  duration-500
                "
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        )}

        {!started && (
          <div
            className="
              mt-5
              flex
              flex-col
              gap-4
              rounded-2xl
              bg-slate-50
              p-4
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-5
              dark:bg-[#132035]
            "
          >
            <div>
              <p
                className="
                  font-averaiserif
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Your roadmap is ready.
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Start the plan to unlock your learning steps.
              </p>
            </div>

            <button
              onClick={onStartPreparation}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-full
                bg-amber-300
                px-5
                py-2.5
                font-averaiserif
                font-bold
                text-slate-950
                transition
                hover:bg-amber-200
                active:scale-[0.98]
              "
            >
              Start Plan
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {completed && (
          <div
            className="
              absolute
              top-0
              right-8
              rounded-full
              
              mt-5
              flex
              items-center
              gap-3
              
              border
              border-amber-200
              bg-amber-50
              p-4
              dark:border-amber-400/20
              dark:bg-amber-400/10
            "
          >
            <div
              className="
                
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-amber-300
                text-slate-950
              "
            >
              <Check size={18} />
            </div>

            <div>
              <p
                className="
                  font-averaiserif
                  font-bold
                  text-amber-700
                  dark:text-amber-300
                "
              >
                Plan completed
              </p>

              <p
                className="
                  text-sm
                  text-amber-700/70
                  dark:text-amber-300/60
                "
              >
                You've completed every learning step.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================
          ROADMAP
      ====================================================== */}

      {mainTopics.length > 0 && (
        <section className="mt-8">
          <div className="mb-5">
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-amber-600
                dark:text-amber-300
              "
            >
              Your roadmap
            </p>

            <h2
              className="
                mt-1
                font-averaiserif
                text-2xl
                font-bold
                text-slate-900
                sm:text-3xl
                dark:text-white
              "
            >
              Follow the path
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              Each topic builds on the one before it.
            </p>
          </div>

          <div className="relative">
            {mainTopics.map((topic, index) => (
              <RoadmapTopic
                key={topic.topicId || topic.topicName || index}
                topic={topic}
                index={index}
                totalTopics={mainTopics.length}
                started={started}
                activeTopicIndex={activeTopicIndex}
                onToggle={onToggleSubtopic}
              />
            ))}
          </div>
        </section>
      )}

      {/* ======================================================
          SUPPORTING SECTIONS
      ====================================================== */}

      <div
        className="
          mt-8
          grid
          gap-4
          lg:grid-cols-3
        "
      >
        <BottomSection title="Next Topics" items={plan.nextTopics} />

        <BottomSection title="Opportunities" items={plan.opportunities} />

        <BottomSection title="Quick Revision" items={plan.quickRevision} />
      </div>

      {/* ======================================================
          EXPECTED OUTCOMES
      ====================================================== */}

      {expectedOutcomes.length > 0 && (
        <section
          className="
            mt-8
            rounded-[26px]
            flex
            flex-col
            items-center
            justify-center
            border
            border-slate-200
            bg-amber-300/80
            p-6
            shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
            sm:p-7
            lg:p-8
            dark:border-slate-700/70
            dark:bg-[#1D2A3E]
          "
        >
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-amber-600
              dark:text-amber-300
            "
          >
            Expected outcomes
          </p>

          <h2
            className="
              mt-2
              font-averaiserif
              text-2xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Where this plan takes you
          </h2>

          <div className="mt-5 items-center gap-3 md:grid-cols-2">
            {expectedOutcomes.map((outcome, index) => (
              <div
                key={`${outcome}-${index}`}
                className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    bg-slate-50
                    p-4
                    dark:bg-[#132035]
                  "
              >
                <div
                  className="
                      mt-0.5
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-amber-300
                      text-slate-950
                    "
                >
                  <Check size={14} strokeWidth={2.5} />
                </div>

                <p
                  className="
                      text-sm
                      font-semibold
                      leading-6
                      text-slate-700
                      dark:text-slate-300
                    "
                >
                  {outcome}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ============================================================
   ROADMAP TOPIC

   IMPORTANT:
   This is the new hierarchy.

   Parent:
          ●──── Main Topic
          │
          │
          ├──── ● Subtopic
          │
          ├──── ● Subtopic
          │
          └──── ● Subtopic

   The rail is physically attached to the parent node
   and each child node.
============================================================ */

function RoadmapTopic({
  topic,
  index,
  totalTopics,
  started,
  activeTopicIndex,
  onToggle,
}) {
  const [open, setOpen] = useState(false);

  const subtopics = Array.isArray(topic.subTopics) ? topic.subTopics : [];
  const keyTopics = getKeyTopics(topic);

  const completed = subtopics.filter((item) => Boolean(item.done)).length;
  const total = subtopics.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const complete = total > 0 && completed === total;

  const inProgress = started && !complete && index === activeTopicIndex;

  const number = String(index + 1).padStart(2, "0");
  const isLast = index === totalTopics - 1;

  return (
    <div className={`relative ${!isLast ? "pb-8" : "pb-2"}`}>
      {/* One centered main-topic rail. Its x-position is the same
          as the center of the 56px main node below. */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="
            absolute
            left-[27px]
            top-[56px]
            bottom-0
            z-0
            w-[2px]
            bg-slate-300
            dark:bg-slate-700
          "
        />
      )}

      <div className="relative flex items-start gap-4">
        {/* Main topic status node */}
        <div
          className={`
            relative
            z-20
            flex
            h-[56px]
            w-[56px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border-4
            border-gray-200
            transition-colors
            duration-300
            dark:border-[#0F172A]
            ${
              complete
                ? "bg-amber-300 text-slate-950"
                : inProgress
                  ? "bg-amber-300 text-slate-950"
                  : "bg-white text-slate-600 dark:bg-[#1D2A3E] dark:text-slate-300"
            }
          `}
        >
          {complete ? (
            <Check size={23} strokeWidth={3} className="block shrink-0" />
          ) : (
            <span className="block text-sm font-bold leading-none">
              {number}
            </span>
          )}
        </div>

        {/* Main topic card */}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="
              group
              w-full
              rounded-[24px]
              border
              border-slate-200
              bg-white
              p-5
              text-left
              shadow-[0_1px_2px_rgba(15,23,42,0.04)]
              dark:shadow-none
              transition-colors
              duration-300
              sm:p-6
              dark:border-slate-700/70
              dark:bg-[#1D2A3E]
            "
          >
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className="
                    mt-1
                    font-averaiserif
                    text-xl
                    font-bold
                    leading-tight
                    text-slate-900
                    sm:text-2xl
                    dark:text-white
                  "
                >
                  {topic.topicName}
                </h3>

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    text-xs
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  <span>
                    {completed}/{total} steps
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>{topic.estimatedStudyTime || "Study time"}</span>
                  <span aria-hidden="true">•</span>
                  <span>{topic.difficultyLevel || "Medium"}</span>
                </div>
              </div>

              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-50
                  text-slate-400
                  transition-transform
                  duration-300
                  group-hover:text-slate-600
                  dark:bg-[#132035]
                  dark:text-slate-500
                  ${open ? "rotate-90" : ""}
                `}
              >
                <ChevronRight size={19} className="block shrink-0" />
              </div>
            </div>

            {keyTopics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {keyTopics.map((item, keyIndex) => (
                  <span
                    key={`${item}-${keyIndex}`}
                    className="
                      rounded-full
                      bg-slate-100
                      px-3
                      py-1.5
                      text-[11px]
                      font-medium
                      text-slate-600
                      dark:bg-[#23344B]
                      dark:text-slate-300
                    "
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Step progress
                </span>

                <span
                  className="
                    text-[11px]
                    font-semibold
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {percentage}%
                </span>
              </div>

              <div
                className="
                  h-2
                  overflow-hidden
                  rounded-full
                  bg-slate-200
                  dark:bg-slate-700
                "
              >
                <div
                  className={`
                    h-full
                    rounded-full
                    transition-all
                    duration-500
                    ${
                      complete
                        ? "bg-blue-500"
                        : inProgress
                          ? "bg-amber-300"
                          : "bg-slate-300 dark:bg-slate-600"
                    }
                  `}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </button>

          {open && subtopics.length > 0 && (
            <div className="relative mt-3 space-y-2 pl-0 animate-studyplan-fade">
              {subtopics.map((subtopic, subIndex) => {
                const previous = subIndex > 0 ? subtopics[subIndex - 1] : null;

                const unlocked =
                  started && (!previous || Boolean(previous.done));

                return (
                  <RoadmapSubtopic
                    key={
                      subtopic.subtopicId || subtopic.subTopicName || subIndex
                    }
                    subtopic={subtopic}
                    index={subIndex}
                    unlocked={unlocked}
                    started={started}
                    isLast={subIndex === subtopics.length - 1}
                    onToggle={onToggle}
                  />
                );
              })}
            </div>
          )}

          {open && (
            <div className="mt-4 space-y-2 pl-0">
              {topic.completionOutcome && (
                <div
                  className="
                    rounded-2xl
                    bg-slate-50
                    p-4
                    dark:bg-[#132035]
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.15em]
                      text-amber-600
                      dark:text-amber-300
                    "
                  >
                    Topic outcome
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {topic.completionOutcome}
                  </p>
                </div>
              )}

              {topic.commonMistakes?.length > 0 && (
                <Accordion
                  title="Common mistakes"
                  items={topic.commonMistakes}
                />
              )}

              {topic.keyTips?.length > 0 && (
                <Accordion title="Key tips" items={topic.keyTips} />
              )}

              {topic.resources && (
                <ResourceAccordion resources={topic.resources} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROADMAP SUBTOPIC

   All subtopic status nodes share exactly the same center
   point as the main roadmap node. One continuous rail is
   used for the child sequence, so no duplicate lines appear.
============================================================ */

function RoadmapSubtopic({
  subtopic,
  index,
  unlocked,
  started,
  isLast,
  onToggle,
}) {
  const complete = Boolean(subtopic.done);
  const inProgress = started && unlocked && !complete;
  const canToggle = started && unlocked;

  return (
    <div className="group relative min-h-[98px] pl-8 pt-2">
      {/* Child elbow: aligned to the center of the roadmap node. */}
      <div
        aria-hidden="true"
        className="
          absolute
          left-[-45px]
          top-0
          h-[48px]
          w-[69px]
          rounded-bl-[14px]
          border-b-2
          border-l-2
          border-slate-300
          dark:border-slate-700
        "
      />

      {/* Continuation line between subtopics. */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="
            absolute
            left-[-45px]
            top-[48px]
            bottom-0
            z-0
            w-[2px]
            bg-slate-300
            dark:bg-slate-700
          "
        />
      )}

      {/* Single status node. */}
      <div
        className={`
          absolute
          left-[-16px]
          top-[30px]
          z-10
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          border-2
          border-white
          bg-amber-300
          transition-colors
          duration-300
          dark:border-[#1D2A3E]
          ${
            complete
              ? "bg--300 text-slate-950"
              : inProgress
                ? "bg-amber-200 text-slate-950"
                : "bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-500"
          }
        `}
      >
        {complete ? (
          <Check size={14} strokeWidth={3} className="block shrink-0" />
        ) : (
          <span className="block text-[10px] font-bold leading-none">
            {index + 1}
          </span>
        )}
      </div>

      {/* Subtopic card */}
      <div
        className={`
          relative
          rounded-2xl
          border
          p-4
          transition-colors
          duration-300
          ${
            complete
              ? " border-0 shadow-md border-sky-400 bg-sky-400/40  dark:border-sky-300/20 dark:bg-sky-300/5"
              : inProgress
                ? "border-amber-200/20 bg-gray-400/20 dark:border-amber-300/20 dark:bg-white-300/10"
                : "border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-[#142033]"
          }
        `}
      >
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h4
              className={`
                text-sm
                font-semibold
                leading-6
                ${
                  complete
                    ? "text-amber-700 text-shadow-2xs  dark:text-amber-300"
                    : inProgress
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-slate-700 dark:text-slate-200"
                }
              `}
            >
              {subtopic.subTopicName}
            </h4>

            {subtopic.whatToLearn && (
              <p
                className="
                  mt-1
                  text-[13px]
                  leading-5
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {subtopic.whatToLearn}
              </p>
            )}

            {Array.isArray(subtopic.keyConcepts) &&
              subtopic.keyConcepts.length > 0 && (
                <div className="mt-3">
                  <h1
                    className="
                    mb-2
                    text-[12px]
                    font-medium
                    text-slate-500
                    dark:text-slate-400
                  "
                  >
                    Topics to focus on
                  </h1>

                  <div className="flex flex-wrap gap-1.5">
                    {subtopic.keyConcepts.map((concept, conceptIndex) => (
                      <span
                        key={`${concept}-${conceptIndex}`}
                        className="
              rounded-full
              bg-white
              px-2.5
              py-1
              text-[10px]
              font-medium
              text-slate-500
              dark:bg-[#23344B]
              dark:text-slate-400
            "
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {!complete && started && !unlocked && (
              <div
                className="
                  mt-3
                  flex
                  items-center
                  gap-1.5
                  text-[11px]
                  text-slate-400
                  dark:text-slate-500
                "
              >
                <Lock size={11} className="shrink-0" />
                Complete the previous step first
              </div>
            )}
          </div>

          {/* Proper completion/revisit toggle */}
          <button
            type="button"
            disabled={!canToggle}
            onClick={() => onToggle(subtopic.subtopicId, !complete)}
            aria-pressed={complete}
            aria-label={
              complete
                ? `Revisit ${subtopic.subTopicName}`
                : `Mark ${subtopic.subTopicName} complete`
            }
            className="
              shrink-0
              rounded-full
              p-1
              outline-none
              transition-opacity
              focus-visible:ring-2
              focus-visible:ring-amber-300
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span
              className={`
                relative
                flex
                h-7
                w-12
                items-center
                rounded-full
                border
                transition-colors
                duration-300
                ease-out
                ${
                  complete
                    ? "border-amber-300 bg-amber-300"
                    : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
                }
              `}
            >
              <span
                className={`
                  absolute
                  top-1/2
                  flex
                  h-5
                  w-5
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-amber-500
                  shadow-[0_1px_2px_rgba(15,23,42,0.08)]
                  transition-transform
                  duration-300
                  ease-out
                  ${complete ? "translate-x-6" : "translate-x-1"}
                `}
              >
                <Check
                  size={12}
                  strokeWidth={3}
                  className={`
                    transition-all
                    duration-200
                    ease-out
                    ${complete ? "scale-100 opacity-100" : "scale-50 opacity-0"}
                  `}
                />
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   KEY TOPICS
============================================================ */

function getKeyTopics(topic) {
  const raw =
    Array.isArray(topic?.keyTopics) && topic.keyTopics.length > 0
      ? topic.keyTopics
      : Array.isArray(topic?.keyConcepts)
        ? topic.keyConcepts
        : [];

  return raw
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return (
        item?.title ||
        item?.name ||
        item?.topicName ||
        item?.label ||
        item?.concept ||
        ""
      );
    })
    .filter(Boolean);
}

/* ============================================================
   EXPECTED OUTCOMES
============================================================ */

function getExpectedOutcomes(plan) {
  const multiple = plan?.goalOverview?.expectedOutcomes;

  if (Array.isArray(multiple)) {
    return multiple
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item?.description || item?.outcome || item?.title || "";
      })
      .filter(Boolean);
  }

  const single = plan?.goalOverview?.expectedOutcome;

  if (typeof single === "string" && single.trim()) {
    return [single];
  }

  if (single && typeof single === "object") {
    const value = single.description || single.outcome || single.title || "";

    return value ? [value] : [];
  }

  return [];
}

/* ============================================================
   DETAIL STAT
============================================================ */

function DetailStat({ label, value }) {
  return (
    <div
      className="
        rounded-2xl
        bg-slate-50
        p-4
        dark:bg-[#132035]
      "
    >
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-semibold
          text-slate-700
          dark:text-slate-200
        "
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   ACCORDION
============================================================ */

function Accordion({ title, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        bg-slate-50
        dark:bg-[#132035]
      "
    >
      <button
        onClick={() => setOpen((value) => !value)}
        className="
          flex
          w-full
          items-center
          justify-between
          px-4
          py-3
          text-sm
          font-semibold
          text-slate-800
          dark:text-slate-200
        "
      >
        {title}

        <ChevronRight
          size={16}
          className={`
            transition-transform
            duration-200
            ${open ? "rotate-90" : ""}
          `}
        />
      </button>

      {open && (
        <div
          className="
            border-t
            border-slate-200
            px-4
            py-3
            dark:border-slate-700/60
          "
        >
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="
                    flex
                    gap-2
                    text-sm
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
              >
                <span
                  className="
                      mt-2
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-amber-300
                    "
                />

                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RESOURCES
============================================================ */

function ResourceAccordion({ resources }) {
  const [open, setOpen] = useState(false);

  const documents = resources?.documentation ? [resources.documentation] : [];

  const youtube = Array.isArray(resources?.youtube) ? resources.youtube : [];

  const other = resources?.extra ? [resources.extra] : [];

  const hasResources =
    documents.length > 0 || youtube.length > 0 || other.length > 0;

  if (!hasResources) {
    return null;
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        bg-slate-50
        dark:bg-[#132035]
      "
    >
      <button
        onClick={() => setOpen((value) => !value)}
        className="
          flex
          w-full
          items-center
          justify-between
          px-4
          py-3
          text-sm
          font-semibold
          text-slate-800
          dark:text-slate-200
        "
      >
        Resources
        <ChevronRight
          size={16}
          className={`
            transition-transform
            duration-200
            ${open ? "rotate-90" : ""}
          `}
        />
      </button>

      {open && (
        <div
          className="
            space-y-4
            border-t
            border-slate-200
            px-4
            py-3
            dark:border-slate-700/60
          "
        >
          {/* DOCUMENTS */}
          {documents.length > 0 && (
            <div>
              <h4
                className="
                  mb-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Documents
              </h4>

              <div className="space-y-2">
                {documents.map((resource, index) => (
                  <div
                    key={`document-${index}`}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      bg-white
                      px-3
                      py-2.5
                      dark:bg-[#1D2A3E]
                    "
                  >
                    <FileText
                      size={15}
                      className="
                        shrink-0
                        text-slate-400
                        dark:text-slate-500
                      "
                    />

                    <span
                      className="
                        text-sm
                        text-slate-600
                        dark:text-slate-300
                      "
                    >
                      {resource.title || resource.name || "Learning resource"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YOUTUBE */}
          {youtube.length > 0 && (
            <div>
              <h4
                className="
                  mb-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                  dark:text-slate-400
                "
              >
                YouTube
              </h4>

              <div className="space-y-2">
                {youtube.map((resource, index) => (
                  <div
                    key={`youtube-${index}`}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      bg-white
                      px-3
                      py-2.5
                      dark:bg-[#1D2A3E]
                    "
                  >
                    <Play
                      size={15}
                      className="
                        shrink-0
                        text-slate-400
                        dark:text-slate-500
                      "
                    />

                    <span
                      className="
                        text-sm
                        text-slate-600
                        dark:text-slate-300
                      "
                    >
                      {resource.title || resource.name || "Learning resource"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   BOTTOM SECTIONS
============================================================ */

function BottomSection({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section
      className="
        rounded-[22px]
        border
        border-slate-200
        bg-white
        p-5
        shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none
        dark:border-slate-700/70
        dark:bg-[#1D2A3E]
      "
    >
      <h2
        className="
          font-averaiserif
          text-xl
          font-bold
          text-slate-900
          dark:text-white
        "
      >
        {title}
      </h2>

      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="
                flex
                gap-2
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
          >
            <span
              className="
                  mt-2
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-amber-300
                "
            />

            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
