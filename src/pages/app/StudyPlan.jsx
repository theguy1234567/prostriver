import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  LoaderCircle,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";

const EMPTY_FORM = {
  topic: "",
  timeAvailable: "",
  purpose: "",
  level: "Intermediate",
  notes: "",
};

const STATUS_COPY = {
  QUEUED: "Queued",
  PROCESSING: "Generating",
  DONE: "Ready",
  FAILED: "Failed",
};

export default function StudyPlan() {
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
     LOAD PLANS
  ============================================================ */

  const loadPlans = async () => {
    setIsLoadingPlans(true);
    setError("");

    try {
      const response = await apiFetch("/api/study-plan");

      let planIds = [];

      if (Array.isArray(response)) {
        planIds = response
          .map((item) => (typeof item === "string" ? item : item?.jobId))
          .filter(Boolean);
      } else if (Array.isArray(response?.jobIds)) {
        planIds = response.jobIds.filter(Boolean);
      } else if (Array.isArray(response?.plans)) {
        planIds = response.plans
          .map((item) => (typeof item === "string" ? item : item?.jobId))
          .filter(Boolean);
      }

      if (planIds.length > 0) {
        const results = await Promise.allSettled(
          planIds.map((id) => apiFetch(`/api/study-plan/${id}`)),
        );

        const loadedPlans = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
          .filter(Boolean);

        setPlans(loadedPlans);
      } else {
        setPlans([]);
      }
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
     RETRY TIMER
  ============================================================ */

  useEffect(() => {
    if (retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  /* ============================================================
     PROGRESS
  ============================================================ */

  const progressPercent = useMemo(() => {
    if (!progress.totalSubtopics) return 0;

    return Math.min(
      100,
      Math.round((progress.completedSubtopics / progress.totalSubtopics) * 100),
    );
  }, [progress]);

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

        if (cancelled) return;

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
          return;
        }

        if (nextStatus === "FAILED") {
          setError("Study plan generation failed.");
          return;
        }

        timeoutId = setTimeout(pollJob, 3000);
      } catch (requestError) {
        if (cancelled) return;

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
     DELETE PLAN
  ============================================================ */

  const handleDeletePlan = async (event, selectedJobId) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this study plan?",
    );

    if (!confirmed) return;

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
     OPEN PLAN
  ============================================================ */

  const handleOpenPlan = async (existingPlan) => {
    const selectedJobId = existingPlan?.jobId;

    if (!selectedJobId) return;

    setError("");
    setIsLoadingPlan(true);

    setJobId(selectedJobId);
    setPage("detail");

    try {
      const response = await apiFetch(`/api/study-plan/${selectedJobId}`);

      const nextStatus = response?.status || "QUEUED";

      setJobStatus(nextStatus);

      setProgress({
        startPreparation: Boolean(response?.startPreparation),
        totalSubtopics: Number(response?.totalSubtopics || 0),
        completedSubtopics: Number(response?.completedSubtopics || 0),
      });

      setSelectedPlan(response);

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
     START
  ============================================================ */

  const handleStartPreparation = async () => {
    if (!jobId) return;

    try {
      const response = await apiFetch(`/api/study-plan/${jobId}/start`, {
        method: "PATCH",
      });

      setProgress((previous) => ({
        ...previous,
        startPreparation: Boolean(response?.startPreparation),
      }));
    } catch (requestError) {
      setError(requestError?.message || "We couldn't start your study plan.");
    }
  };

  /* ============================================================
     TOGGLE SUBTOPIC
  ============================================================ */

  const handleToggleSubtopic = async (subtopicId, doneValue) => {
    if (!jobId || !subtopicId || !plan) return;

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
        totalSubtopics: Number(response?.totalSubtopics || 0),
        completedSubtopics: Number(response?.completedSubtopics || 0),
      });

      setPlans((previous) =>
        previous.map((item) =>
          item?.jobId === jobId
            ? {
                ...item,
                completedSubtopics: Number(response?.completedSubtopics || 0),
                totalSubtopics: Number(response?.totalSubtopics || 0),
                status: response?.status || item?.status,
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

    setPage("create");
  };

  /* ============================================================
     HELPERS
  ============================================================ */

  const getPlanTitle = (item) =>
    item?.plan?.goalOverview?.topic || item?.input?.topic || "Study Plan";

  const getPlanPurpose = (item) =>
    item?.input?.purpose ||
    item?.plan?.goalOverview?.purpose ||
    "Personal learning";

  const getPlanLevel = (item) =>
    item?.input?.level ||
    item?.plan?.goalOverview?.currentLevel ||
    "Intermediate";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className="
        min-h-screen
        w-full
        rounded-2xl
        bg-gray-200
        dark:bg-[#0F172A]
        text-black
        dark:text-white
        p-3
        sm:p-5
        lg:p-6
        xl:p-8
        space-y-4
        sm:space-y-6
        mx-auto
      "
    >
      {/* ======================================================
          LIST
      ====================================================== */}

      {page === "list" && (
        <div className="space-y-5">
          {/* Header */}

          <div
            className="
              rounded-3xl
              bg-white
              dark:bg-[#1E293B]
              p-5
              sm:p-7
            "
          >
            <div className="flex flex-col gap-5">
              <div>
                <p className="font-garamound text-sm text-gray-500 dark:text-gray-400">
                  AI Study Planner
                </p>

                <h1 className="mt-1 text-3xl sm:text-4xl font-averaiserif font-bold">
                  Your Study Plans
                </h1>

                <p className="mt-2 max-w-xl text-sm sm:text-base font-garamound text-gray-500 dark:text-gray-300">
                  Continue learning or create a new personalized plan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleNewPlan}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-amber-300
                  px-5
                  py-3
                  text-black
                  shadow-sm
                  font-averaiserif
                  font-bold
                  transition
                  hover:bg-amber-400
                  active:scale-[0.98]
                  sm:w-fit
                "
              >
                <Plus size={18} />
                New Plan
              </button>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] p-4 text-sm font-garamound text-red-500">
              <div className="flex items-center gap-2">
                <XCircle size={18} />

                <span className="flex-1">{error}</span>

                <button onClick={loadPlans} className="font-semibold underline">
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading */}

          {isLoadingPlans && (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                      rounded-2xl
                      bg-white
                      dark:bg-[#1E293B]
                      p-5
                      animate-pulse
                    "
                >
                  <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />

                  <div className="mt-3 h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />

                  <div className="mt-8 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />

                  <div className="mt-5 h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}

          {!isLoadingPlans && plans.length === 0 && !error && (
            <div
              className="
                  rounded-2xl
                  bg-white
                  dark:bg-[#1E293B]
                  p-8
                  sm:p-12
                  text-center
                "
            >
              <BookOpen size={34} className="mx-auto text-gray-400" />

              <h2 className="mt-4 text-xl font-averaiserif font-bold">
                No study plans yet
              </h2>

              <p className="mt-2 font-garamound text-gray-500 dark:text-gray-400">
                Create your first personalized study plan.
              </p>

              <button
                onClick={handleNewPlan}
                className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-amber-300
                    px-5
                    py-2.5
                    font-averaiserif
                    font-bold
                  "
              >
                <Plus size={17} />
                Create Plan
              </button>
            </div>
          )}

          {/* Plans */}

          {!isLoadingPlans && plans.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((item) => {
                const total = Number(item?.totalSubtopics || 0);

                const completed = Number(item?.completedSubtopics || 0);

                const percentage = total
                  ? Math.min(100, Math.round((completed / total) * 100))
                  : 0;

                const status = item?.status || "QUEUED";

                const isCompleted = status === "DONE" && percentage === 100;

                return (
                  <div
                    key={item.jobId}
                    className="
                        rounded-2xl
                        bg-white
                        dark:bg-[#1E293B]
                        p-5
                        transition
                        hover:shadow-md
                      "
                  >
                    <div className="flex items-start gap-3">
                      {/* CLICKABLE PLAN */}

                      <button
                        type="button"
                        onClick={() => handleOpenPlan(item)}
                        className="min-w-0 flex-1 text-left"
                      >
                        {/* Title */}

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-xl font-averaiserif font-bold">
                              {getPlanTitle(item)}
                            </h2>

                            <p className="mt-1 truncate text-sm font-garamound text-gray-500 dark:text-gray-400">
                              {getPlanPurpose(item)}
                            </p>
                          </div>

                          <ChevronRight
                            size={20}
                            className="mt-1 shrink-0 text-gray-400"
                          />
                        </div>

                        {/* Tags */}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 dark:bg-[#0F172A] px-3 py-1 text-xs font-garamound">
                            {getPlanLevel(item)}
                          </span>

                          <span
                            className={`
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-garamound
                                ${
                                  status === "DONE"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    : status === "FAILED"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                }
                              `}
                          >
                            {STATUS_COPY[status] || status}
                          </span>
                        </div>

                        {/* Progress */}

                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-garamound text-gray-500">
                              {total
                                ? `${completed} of ${total} subtopics`
                                : "Preparing plan"}
                            </p>

                            <p className="text-sm font-garamound">
                              {percentage}%
                            </p>
                          </div>

                          <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-[#0F172A] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-300 transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Footer */}

                        <div className="mt-5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-garamound text-gray-400">
                            <Clock3 size={14} />

                            {item?.input?.timeAvailable || "Study plan"}
                          </span>

                          <span
                            className={`font-averaiserif font-semibold ${
                              isCompleted ? "text-green-500" : "text-blue-500"
                            }`}
                          >
                            {isCompleted ? "Completed" : "Continue"}
                          </span>
                        </div>
                      </button>

                      {/* DELETE BUTTON */}

                      <button
                        type="button"
                        aria-label="Delete study plan"
                        title="Delete study plan"
                        onClick={(event) => handleDeletePlan(event, item.jobId)}
                        className="
                            shrink-0
                            h-9
                            w-9
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-gray-400
                            hover:text-red-500
                            hover:bg-red-50
                            dark:hover:bg-red-900/20
                            transition
                          "
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          CREATE
      ====================================================== */}

      {page === "create" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToPlans}
              className="
                h-10
                w-10
                rounded-full
                bg-white
                dark:bg-[#1E293B]
                flex
                items-center
                justify-center
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <p className="font-garamound text-sm text-gray-500">
                Study Planner
              </p>

              <h1 className="text-2xl sm:text-3xl font-averaiserif font-bold">
                Create a study plan
              </h1>
            </div>
          </div>

          <div
            className="
              rounded-2xl
              bg-white
              dark:bg-[#1E293B]
              p-5
              sm:p-7
            "
          >
            <div className="mb-6">
              <h2 className="text-xl font-averaiserif font-bold">
                What do you want to learn?
              </h2>

              <p className="mt-1 font-garamound text-sm text-gray-500">
                Tell us a little about your goal and we'll build the plan.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-500 font-garamound">
                {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Topic"
                name="topic"
                value={form.topic}
                onChange={handleFieldChange}
                placeholder="System Design"
              />

              <FormField
                label="Time Available"
                name="timeAvailable"
                value={form.timeAvailable}
                onChange={handleFieldChange}
                placeholder="2 weeks"
              />

              <FormField
                label="Purpose"
                name="purpose"
                value={form.purpose}
                onChange={handleFieldChange}
                placeholder="SDE interview"
              />

              <label className="space-y-2">
                <span className="text-sm font-averaiserif font-semibold">
                  Current Level
                </span>

                <select
                  name="level"
                  value={form.level}
                  onChange={handleFieldChange}
                  className="
                    w-full
                    rounded-xl
                    bg-gray-100
                    dark:bg-[#0F172A]
                    border-none
                    px-4
                    py-3
                    font-garamound
                    outline-none
                  "
                >
                  <option value="Beginner">Beginner</option>

                  <option value="Intermediate">Intermediate</option>

                  <option value="Expert">Expert</option>
                </select>
              </label>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-averaiserif font-semibold">
                Notes
              </span>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFieldChange}
                rows={4}
                placeholder="Anything specific you want the plan to focus on?"
                className="
                  w-full
                  resize-none
                  rounded-xl
                  bg-gray-100
                  dark:bg-[#0F172A]
                  border-none
                  px-4
                  py-3
                  font-garamound
                  outline-none
                "
              />
            </label>

            {retryAfter > 0 && (
              <p className="mt-4 text-sm font-garamound text-amber-600">
                Please wait {retryAfter}s before creating another plan.
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleBackToPlans}
                className="
                  rounded-full
                  px-5
                  py-3
                  bg-gray-100
                  dark:bg-[#0F172A]
                  font-averaiserif
                  font-semibold
                "
              >
                Cancel
              </button>

              <button
                onClick={handleGeneratePlan}
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
                  text-black
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
      )}

      {/* ======================================================
          DETAIL
      ====================================================== */}

      {page === "detail" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToPlans}
              className="
                h-10
                w-10
                rounded-full
                bg-white
                dark:bg-[#1E293B]
                flex
                items-center
                justify-center
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <p className="font-garamound text-sm text-gray-500">Study Plan</p>

              <h1 className="truncate text-2xl sm:text-3xl font-averaiserif font-bold">
                {plan?.goalOverview?.topic ||
                  selectedPlan?.input?.topic ||
                  "Your Study Plan"}
              </h1>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-white dark:bg-[#1E293B] p-4 text-sm font-garamound text-red-500">
              {error}
            </div>
          )}

          {isLoadingPlan && <LoadingCard text="Opening your study plan..." />}

          {!isLoadingPlan &&
            (jobStatus === "QUEUED" || jobStatus === "PROCESSING") && (
              <LoadingCard text="Creating your study plan..." />
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

/* ================================================================
   FORM FIELD
================================================================ */

function FormField({ label, name, value, onChange, placeholder }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-averaiserif font-semibold">{label}</span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          bg-gray-100
          dark:bg-[#0F172A]
          border-none
          px-4
          py-3
          font-garamound
          outline-none
          placeholder:text-gray-400
        "
      />
    </label>
  );
}

/* ================================================================
   LOADING
================================================================ */

function LoadingCard({ text }) {
  return (
    <div
      className="
        rounded-2xl
        bg-white
        dark:bg-[#1E293B]
        p-12
        text-center
      "
    >
      <LoaderCircle size={32} className="mx-auto animate-spin text-amber-400" />

      <p className="mt-4 font-averaiserif text-lg font-semibold">{text}</p>

      <p className="mt-1 font-garamound text-sm text-gray-500">
        This may take a few seconds.
      </p>
    </div>
  );
}

/* ================================================================
   PLAN CONTENT
================================================================ */

function StudyPlanContent({
  plan,
  progress,
  progressPercent,
  onStartPreparation,
  onToggleSubtopic,
}) {
  return (
    <div className="space-y-5">
      {/* Overview */}

      <div
        className="
          rounded-2xl
          bg-white
          dark:bg-[#1E293B]
          p-5
          sm:p-7
        "
      >
        <div className="flex flex-col gap-5">
          <div>
            <p className="font-garamound text-sm text-gray-500">
              Personalized Study Plan
            </p>

            <h2 className="mt-1 text-2xl sm:text-3xl font-averaiserif font-bold">
              {plan.goalOverview?.expectedOutcome || "Your learning roadmap"}
            </h2>

            {plan.goalOverview?.overview && (
              <p className="mt-2 max-w-3xl font-garamound text-sm leading-6 text-gray-500 dark:text-gray-300">
                {plan.goalOverview.overview}
              </p>
            )}
          </div>

          {/* Progress */}

          <div className="rounded-2xl bg-gray-100 dark:bg-[#0F172A] p-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-garamound text-sm text-gray-500">
                  Your Progress
                </p>

                <p className="mt-1 text-3xl font-averaiserif font-bold">
                  {progressPercent}%
                </p>
              </div>

              <p className="font-garamound text-sm text-gray-500">
                {progress.completedSubtopics} / {progress.totalSubtopics}
              </p>
            </div>

            <div className="mt-3 w-full h-4 rounded-full bg-gray-300 dark:bg-[#1E293B] overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-300 transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>

          {/* Stats */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PlanStat
              label="Total Time"
              value={plan.goalOverview?.totalTimeAvailable || "N/A"}
            />

            <PlanStat
              label="Daily Study"
              value={plan.goalOverview?.recommendedDailyStudyTime || "N/A"}
            />

            <PlanStat
              label="Level"
              value={plan.goalOverview?.currentLevel || "N/A"}
            />
          </div>

          {!progress.startPreparation && (
            <div className="rounded-2xl bg-gray-100 dark:bg-[#0F172A] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-averaiserif font-bold">Ready to start?</p>

                <p className="font-garamound text-sm text-gray-500">
                  Start tracking your progress.
                </p>
              </div>

              <button
                onClick={onStartPreparation}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-amber-300
                  px-5
                  py-2.5
                  font-averaiserif
                  font-bold
                  text-black
                "
              >
                Start
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Topics */}

      {Array.isArray(plan.mainTopics) &&
        plan.mainTopics.map((mainTopic, index) => (
          <MainTopicCard
            key={mainTopic.topicId || mainTopic.topicName || index}
            topic={mainTopic}
            onToggleSubtopic={onToggleSubtopic}
          />
        ))}

      {/* Bottom */}

      <div className="grid gap-4 lg:grid-cols-3">
        <SimplePlanList title="Next Topics" items={plan.nextTopics} />

        <SimplePlanList title="Opportunities" items={plan.opportunities} />

        <SimplePlanList title="Quick Revision" items={plan.quickRevision} />
      </div>
    </div>
  );
}

/* ================================================================
   PLAN STAT
================================================================ */

function PlanStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-100 dark:bg-[#0F172A] p-4">
      <p className="font-garamound text-xs text-gray-500">{label}</p>

      <p className="mt-1 font-averaiserif font-semibold">{value}</p>
    </div>
  );
}

/* ================================================================
   MAIN TOPIC
================================================================ */

function MainTopicCard({ topic, onToggleSubtopic }) {
  return (
    <div
      className="
        rounded-2xl
        bg-white
        dark:bg-[#1E293B]
        p-5
        sm:p-6
      "
    >
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-amber-300
                font-averaiserif
                font-bold
                text-black
                text-sm
              "
            >
              {topic.order || ""}
            </span>

            <h2 className="text-xl sm:text-2xl font-averaiserif font-bold">
              {topic.topicName}
            </h2>
          </div>

          {topic.completionOutcome && (
            <p className="mt-2 font-garamound text-sm leading-6 text-gray-500 dark:text-gray-300">
              {topic.completionOutcome}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {topic.difficultyLevel && (
            <span className="rounded-full bg-gray-100 dark:bg-[#0F172A] px-3 py-1 text-xs font-garamound">
              {topic.difficultyLevel}
            </span>
          )}

          {topic.importanceLevel && (
            <span className="rounded-full bg-gray-100 dark:bg-[#0F172A] px-3 py-1 text-xs font-garamound">
              {topic.importanceLevel}
            </span>
          )}

          {topic.estimatedStudyTime && (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-garamound">
              {topic.estimatedStudyTime}
            </span>
          )}
        </div>
      </div>

      {/* Subtopics */}

      <div className="mt-5 space-y-3">
        {(topic.subTopics || []).map((subtopic) => (
          <div
            key={subtopic.subtopicId || subtopic.subTopicName}
            className={`
                rounded-2xl
                p-4
                ${
                  subtopic.done
                    ? "bg-green-50 dark:bg-green-900/10"
                    : "bg-gray-100 dark:bg-[#0F172A]"
                }
              `}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() =>
                  onToggleSubtopic(subtopic.subtopicId, !subtopic.done)
                }
                className={`
                    mt-0.5
                    h-6
                    w-6
                    shrink-0
                    rounded-full
                    flex
                    items-center
                    justify-center
                    border-2
                    ${
                      subtopic.done
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-400 dark:border-gray-600"
                    }
                  `}
              >
                {subtopic.done && <Check size={14} />}
              </button>

              <div className="min-w-0">
                <h3
                  className={`
                      font-averaiserif
                      font-semibold
                      ${subtopic.done ? "line-through text-green-600" : ""}
                    `}
                >
                  {subtopic.subTopicName}
                </h3>

                {subtopic.whatToLearn && (
                  <p className="mt-1 font-garamound text-sm leading-6 text-gray-500 dark:text-gray-300">
                    {subtopic.whatToLearn}
                  </p>
                )}

                {Array.isArray(subtopic.keyConcepts) &&
                  subtopic.keyConcepts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {subtopic.keyConcepts.map((concept) => (
                        <span
                          key={concept}
                          className="
                                rounded-full
                                bg-white
                                dark:bg-[#1E293B]
                                px-3
                                py-1
                                text-xs
                                font-garamound
                                text-gray-500
                              "
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resources */}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ResourceSection resources={topic.resources} />

        <div className="space-y-4">
          {topic.commonMistakes?.length > 0 && (
            <SimpleSection
              title="Common Mistakes"
              items={topic.commonMistakes}
            />
          )}

          {topic.keyTips?.length > 0 && (
            <SimpleSection title="Key Tips" items={topic.keyTips} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SIMPLE LIST
================================================================ */

function SimplePlanList({ title, items }) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1E293B] p-5">
      <h3 className="text-xl font-averaiserif font-bold">{title}</h3>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 font-garamound text-sm leading-6 text-gray-500 dark:text-gray-300"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />

            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================
   SIMPLE SECTION
================================================================ */

function SimpleSection({ title, items }) {
  return (
    <div className="rounded-2xl bg-gray-100 dark:bg-[#0F172A] p-4">
      <h3 className="font-averaiserif font-bold">{title}</h3>

      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 font-garamound text-sm leading-6 text-gray-500 dark:text-gray-300"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />

            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================
   RESOURCES
================================================================ */

function ResourceSection({ resources }) {
  if (!resources) return null;

  const documentation = resources.documentation;

  const youtube = Array.isArray(resources.youtube) ? resources.youtube : [];

  const extra = resources.extra;

  return (
    <div className="rounded-2xl bg-gray-100 dark:bg-[#0F172A] p-4">
      <h3 className="font-averaiserif font-bold">Resources</h3>

      <div className="mt-3 space-y-2">
        {documentation?.url && <ResourceLink item={documentation} />}

        {youtube.map((item) => (
          <ResourceLink key={`${item.title}-${item.url}`} item={item} />
        ))}

        {extra?.url && <ResourceLink item={extra} />}
      </div>
    </div>
  );
}

function ResourceLink({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="
        flex
        items-center
        justify-between
        gap-3
        rounded-xl
        bg-white
        dark:bg-[#1E293B]
        px-3
        py-2.5
        font-garamound
        text-sm
        text-gray-600
        dark:text-gray-300
        transition
        hover:bg-amber-50
        dark:hover:bg-amber-900/10
      "
    >
      <span className="truncate">{item.title}</span>

      <ExternalLink size={15} className="shrink-0 text-gray-400" />
    </a>
  );
}
