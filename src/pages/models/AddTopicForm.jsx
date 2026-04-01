import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { X, ChevronDown, Info, Check } from "lucide-react";
import { apiFetch } from "../../utils/apiFetch";

export default function AddTopicForm({
  closeModal,
  editingTopic,
  refreshTopics,
}) {
  const isEdit = !!editingTopic;

  const [title, setTitle] = useState(editingTopic?.title || "");
  const [subject, setSubject] = useState(editingTopic?.subject || "");
  const [notes, setNotes] = useState(editingTopic?.notes || "");
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [revisionPlans, setRevisionPlans] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState("none");
  const [manualPattern, setManualPattern] = useState("");
  
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", handleKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [closeModal]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (isEdit) return;

    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        const data = await apiFetch("/api/topics/revisions/get-all", {
          method: "GET",
        });
        setRevisionPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load revision plans");
      } finally {
        setPlansLoading(false);
      }
    };

    loadPlans();
  }, [isEdit]);

  const selectedPlan = useMemo(
    () => revisionPlans.find((p) => p.id === selectedRevision),
    [revisionPlans, selectedRevision],
  );

  const validatePattern = (pattern) => {
    if (!pattern) return null;
    const cleaned = pattern.replace(/\s+/g, "");

    if (!/^(\d+)(,\d+)*$/.test(cleaned)) {
      toast.error("Use format like 1,4,7");
      return false;
    }

    const days = cleaned.split(",").map(Number);

    if (days.some((day) => day < 1 || day > 15)) {
      toast.error("Revision days must be between 1 and 15");
      return false;
    }

    if (new Set(days).size !== days.length) {
      toast.error("Duplicate days are not allowed");
      return false;
    }

    return cleaned;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !subject.trim()) {
      toast.error("Title and Subject are required");
      return;
    }

    let revisionPlanId = null;
    let cleanedPattern = null;

    if (!isEdit) {
      if (selectedRevision === "custom") {
        const validated = validatePattern(manualPattern);
        if (validated === false) return;
        cleanedPattern = validated;
      } else if (selectedRevision && selectedRevision !== "none") {
        revisionPlanId = selectedRevision;
      }
    }

    try {
      setLoading(true);

      const body = {
        title: title.trim(),
        subject: subject.trim(),
        notes: notes.trim(),
      };

      if (!isEdit) {
        body.revisionPlanId = revisionPlanId || undefined;
        body.manualReminderPattern = cleanedPattern || undefined;
      }

      await apiFetch(
        isEdit ? `/api/topics/${editingTopic.id}` : "/api/topics",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify(body),
        },
      );

      toast.success(isEdit ? "Topic updated" : "Topic added");
      await refreshTopics();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const dropdownLabel =
    selectedRevision === "custom"
      ? "Custom Pattern"
      : selectedRevision === "none"
        ? "No Revision"
        : selectedPlan?.name || "Choose a revision plan";

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-md flex justify-center items-start px-4 overflow-y-auto"
      style={{ paddingTop: "110px", paddingBottom: "24px" }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E293B] shadow-2xl p-6 sm:p-7 my-6">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
          {isEdit ? "Edit Topic" : "Add New Topic"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Topic title"
            className="w-full h-12 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400"
          />

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full h-12 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400"
          />

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 dark:text-white outline-none resize-none focus:ring-2 focus:ring-amber-400"
          />

          {!isEdit && (
            <>
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Revision Plan (Optional)
                </label>

                <button
                  type="button"
                  onClick={() => setDropdownOpen((p) => !p)}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 dark:text-white border border-slate-200 dark:border-zinc-700 hover:border-amber-300 flex items-center justify-between transition-all"
                >
                  <span className="truncate">
                    {plansLoading ? "Loading..." : dropdownLabel}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRevision("none");
                        setManualPattern("");
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 dark:hover:bg-zinc-800 transition"
                    >
                      No Revision
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRevision("custom");
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 dark:hover:bg-zinc-800 transition"
                    >
                      Custom Pattern
                    </button>

                    {revisionPlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onMouseEnter={() => setHoveredPlan(plan)}
                        onMouseLeave={() => setHoveredPlan(null)}
                        onClick={() => {
                          setSelectedRevision(plan.id);
                          setManualPattern("");
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 dark:hover:bg-zinc-800 transition flex items-center justify-between"
                      >
                        <div>
                          <p>{plan.name}</p>
                          {hoveredPlan?.id === plan.id && plan.description && (
                            <p className="text-xs text-slate-500 mt-1">
                              {plan.description}
                            </p>
                          )}
                        </div>
                        {selectedRevision === plan.id && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                )}

                {selectedPlan?.description && (
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="mt-0.5 text-amber-500" />
                      <div>
                        <p className="font-medium">{selectedPlan.name}</p>
                        <p className="text-xs opacity-80 mt-1">
                          {selectedPlan.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedRevision === "custom" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Custom Revision Pattern
                  </label>
                  <input
                    value={manualPattern}
                    onChange={(e) => setManualPattern(e.target.value)}
                    placeholder="Example: 1,4,7"
                    className="w-full h-12 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-amber-400 hover:bg-amber-500 transition font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Saving..." : isEdit ? "Update Topic" : "Save Topic"}
          </button>
        </form>
      </div>
    </div>
  );
}
