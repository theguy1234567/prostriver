import React, { useContext, useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  LoaderCircle,
  Lock,
  Plus,
  XCircle,
} from "lucide-react";

import { apiFetch } from "../../utils/apiFetch";
import { ThemeContext } from "../../context/ThemeContext";
import StudyPlanCard from "../../components/app_components/StudyPlanCard";

const EMPTY_FORM = {
  topic: "",
  timeAvailable: "",
  purpose: "",
  level: "Intermediate",
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
  const { dark } = useContext(ThemeContext);

  /*
   * Same animation approach as Analytics
   */
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

  /*
   * EXACT SAME FADE-IN AS ANALYTICS
   */

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
     MAIN WRAPPER ANIMATION
     
     EXACTLY LIKE ANALYTICS:
     
     transition-all duration-700
     opacity-0 translate-y-3
     ->
     opacity-100 translate-y-0
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
            max-w-[1500px]
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
                shadow-lg
                shadow-amber-300/10
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
                      shadow-sm
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
                  shadow-sm
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
            max-w-[1200px]
            ${pageAnimation}
          `}
        >
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={handleBackToPlans}
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-sm
                transition
                hover:bg-slate-50
                dark:border-slate-700
                dark:bg-[#1D2A3E]
                dark:text-slate-300
                dark:hover:bg-[#26364D]
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <p
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
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
                  text-slate-900
                  sm:text-3xl
                  dark:text-white
                "
              >
                {plan?.goalOverview?.topic ||
                  selectedPlan?.input?.topic ||
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
    <div className="mx-auto max-w-[900px]">
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
            shadow-sm
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
          shadow-sm
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

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              shadow-sm
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
        shadow-sm
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

  return (
    <div
      className="
        transition-all
        duration-700
        opacity-100
        translate-y-0
      "
    >
      <section
        className="
          rounded-[26px]
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:p-7
          dark:border-slate-700/70
          dark:bg-[#1D2A3E]
        "
      >
        <p
          className="
            text-xs
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          Personalized roadmap
        </p>

        <h2
          className="
            mt-2
            max-w-4xl
            font-averaiserif
            text-2xl
            font-bold
            text-slate-900
            sm:text-3xl
            dark:text-white
          "
        >
          {plan.goalOverview?.expectedOutcome || "Your learning roadmap"}
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <DetailStat
            label="Total time"
            value={plan.goalOverview?.totalTimeAvailable || "N/A"}
          />

          <DetailStat
            label="Daily study"
            value={plan.goalOverview?.recommendedDailyStudyTime || "N/A"}
          />

          <DetailStat
            label="Level"
            value={plan.goalOverview?.currentLevel || "N/A"}
          />
        </div>

        {started && (
          <div
            className="
              mt-5
              rounded-2xl
              bg-slate-50
              p-4
              dark:bg-[#132035]
            "
          >
            <div className="flex items-end justify-between">
              <div>
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  Overall progress
                </p>

                <p
                  className="
                    mt-1
                    font-averaiserif
                    text-3xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {progressPercent}%
                </p>
              </div>

              <p
                className="
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {progress.completedSubtopics} / {progress.totalSubtopics}
              </p>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
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
                Ready to begin?
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                  dark:text-slate-500
                "
              >
                Start the plan to begin tracking your progress.
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
              mt-5
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-blue-200
              bg-blue-50
              p-4
              dark:border-blue-400/20
              dark:bg-blue-400/10
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
                bg-blue-500
                text-white
              "
            >
              <Check size={18} />
            </div>

            <div>
              <p
                className="
                  font-averaiserif
                  font-bold
                  text-blue-600
                  dark:text-blue-300
                "
              >
                Plan completed
              </p>

              <p
                className="
                  text-sm
                  text-blue-600/70
                  dark:text-blue-300/60
                "
              >
                You've completed every subtopic.
              </p>
            </div>
          </div>
        )}
      </section>

      {Array.isArray(plan.mainTopics) &&
        plan.mainTopics.map((topic, index) => (
          <div
            key={topic.topicId || topic.topicName || index}
            className="
                mt-5
                transition-all
                duration-700
                opacity-100
                translate-y-0
              "
            style={{
              transitionDelay: `${(index + 1) * 70}ms`,
            }}
          >
            <MainTopic
              topic={topic}
              index={index}
              started={started}
              onToggle={onToggleSubtopic}
            />
          </div>
        ))}

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <BottomSection title="Next Topics" items={plan.nextTopics} />

        <BottomSection title="Opportunities" items={plan.opportunities} />

        <BottomSection title="Quick Revision" items={plan.quickRevision} />
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL STAT
============================================================ */

function DetailStat({ label, value }) {
  return (
    <div
      className="
        rounded-xl
        bg-slate-50
        p-4
        dark:bg-[#132035]
      "
    >
      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-slate-500
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
   MAIN TOPIC
============================================================ */

function MainTopic({ topic, index, started, onToggle }) {
  const [open, setOpen] = useState(false);

  const subtopics = Array.isArray(topic.subTopics) ? topic.subTopics : [];

  const completed = subtopics.filter((item) => item.done).length;

  const total = subtopics.length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const complete = total > 0 && completed === total;

  const topicNumber = String(index + 1).padStart(2, "0");

  return (
    <section
      className="
        overflow-hidden
        rounded-[26px]
        border
        border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-700/70
        dark:bg-[#1D2A3E]
      "
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="
          flex
          w-full
          items-center
          gap-4
          p-5
          text-left
          transition
          hover:bg-slate-50
          sm:p-6
          dark:hover:bg-[#202F45]
        "
      >
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${
              complete
                ? "bg-blue-50 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300"
                : "bg-amber-300 text-slate-950"
            }
          `}
        >
          {complete ? (
            <Check size={23} strokeWidth={2.5} />
          ) : (
            <span
              className="
                text-sm
                font-bold
                tracking-wide
              "
            >
              {topicNumber}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="
              font-averaiserif
              text-lg
              font-bold
              leading-tight
              text-slate-900
              sm:text-xl
              dark:text-white
            "
          >
            {topic.topicName}
          </h2>

          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-3
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            <span>
              {completed}/{total} tasks
            </span>

            <span>•</span>

            <span>{topic.estimatedStudyTime || "Study time"}</span>

            <span>•</span>

            <span>{topic.difficultyLevel || "Medium"}</span>
          </div>

          <div className="mt-3 max-w-xl">
            <div className="mb-1.5 flex justify-between">
              <span
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Topic progress
              </span>

              <span
                className="
                  text-[11px]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {percentage}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`
                  h-full
                  rounded-full
                  transition-all
                  duration-500
                  ${complete ? "bg-blue-500" : "bg-amber-300"}
                `}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        </div>

        <ChevronRight
          size={22}
          className={`
            shrink-0
            text-slate-400
            transition-transform
            duration-300
            ${open ? "rotate-90" : ""}
          `}
        />
      </button>

      {open && (
        <div
          className="
            border-t
            border-slate-200
            p-5
            sm:p-6
            dark:border-slate-700/70
          "
        >
          {topic.completionOutcome && (
            <div
              className="
                mb-5
                rounded-xl
                bg-slate-50
                p-4
                dark:bg-[#132035]
              "
            >
              <p
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Outcome
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

          <div className="space-y-2">
            {subtopics.map((subtopic, subIndex) => {
              const previous = subIndex > 0 ? subtopics[subIndex - 1] : null;

              const unlocked = started && (!previous || Boolean(previous.done));

              return (
                <Subtopic
                  key={subtopic.subtopicId || subtopic.subTopicName || subIndex}
                  subtopic={subtopic}
                  index={subIndex}
                  unlocked={unlocked}
                  started={started}
                  onToggle={onToggle}
                />
              );
            })}
          </div>

          <div className="mt-5 space-y-2">
            {topic.commonMistakes?.length > 0 && (
              <Accordion title="Common mistakes" items={topic.commonMistakes} />
            )}

            {topic.keyTips?.length > 0 && (
              <Accordion title="Key tips" items={topic.keyTips} />
            )}

            {topic.resources && (
              <ResourceAccordion resources={topic.resources} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   SUBTOPIC
============================================================ */

function Subtopic({ subtopic, index, unlocked, started, onToggle }) {
  const complete = Boolean(subtopic.done);

  const canClick = started && unlocked;

  return (
    <div
      className={`
        rounded-xl
        border
        p-4
        transition-all
        ${
          complete
            ? "border-blue-200 bg-blue-50/60 dark:border-blue-400/20 dark:bg-blue-400/5"
            : unlocked
              ? "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-[#17263A] dark:hover:border-slate-600"
              : "border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-[#142033]"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={!canClick}
          onClick={() => onToggle(subtopic.subtopicId, !complete)}
          className={`
            mt-0.5
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            transition
            ${
              complete
                ? "bg-blue-500 text-white"
                : canClick
                  ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
                  : "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
            }
          `}
        >
          {complete ? (
            <Check size={18} strokeWidth={2.5} />
          ) : unlocked ? (
            <span className="text-xs font-bold">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : (
            <Lock size={15} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span
              className="
                text-[11px]
                font-semibold
                text-slate-400
                dark:text-slate-500
              "
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3
              className={`
                text-sm
                font-semibold
                leading-6
                ${
                  complete
                    ? "text-blue-600 line-through dark:text-blue-300"
                    : "text-slate-700 dark:text-slate-200"
                }
              `}
            >
              {subtopic.subTopicName}
            </h3>
          </div>

          {subtopic.whatToLearn && (
            <p
              className="
                mt-1
                pl-7
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
              <div className="mt-3 flex flex-wrap gap-1.5 pl-7">
                {subtopic.keyConcepts.map((concept) => (
                  <span
                    key={concept}
                    className="
                        rounded-md
                        bg-slate-100
                        px-2
                        py-1
                        text-[11px]
                        text-slate-500
                        dark:bg-[#23344B]
                        dark:text-slate-400
                      "
                  >
                    {concept}
                  </span>
                ))}
              </div>
            )}

          {!complete && started && !unlocked && (
            <div
              className="
                  mt-3
                  flex
                  items-center
                  gap-1.5
                  pl-7
                  text-[11px]
                  text-slate-400
                  dark:text-slate-500
                "
            >
              <Lock size={11} />
              Complete the previous task first
            </div>
          )}
        </div>
      </div>
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

        <ChevronRight size={16} className={open ? "rotate-90" : ""} />
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

  const all = [
    resources?.documentation,
    ...(Array.isArray(resources?.youtube) ? resources.youtube : []),
    resources?.extra,
  ].filter(Boolean);

  if (!all.length) {
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
        <ChevronRight size={16} className={open ? "rotate-90" : ""} />
      </button>

      {open && (
        <div
          className="
            space-y-2
            border-t
            border-slate-200
            px-4
            py-3
            dark:border-slate-700/60
          "
        >
          {all.map((resource, index) => (
            <div
              key={`${resource.title || resource.name}-${index}`}
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
        shadow-sm
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
