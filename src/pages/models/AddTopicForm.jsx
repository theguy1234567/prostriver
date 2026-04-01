import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
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

  const [revisionPlans, setRevisionPlans] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState("");
  const [manualPattern, setManualPattern] = useState("");

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
      } else if (selectedRevision) {
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

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-md flex justify-center items-start px-4"
      style={{ paddingTop: "110px", paddingBottom: "24px" }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E293B] shadow-2xl p-6 sm:p-7"
        style={{
          maxHeight: "calc(100vh - 140px)",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
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
            className="w-full h-12 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-amber-400"
          />

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full h-12 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-amber-400"
          />

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 outline-none resize-none focus:ring-2 focus:ring-amber-400"
          />

          {!isEdit && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Revision Plan (Optional)
                </label>
                <select
                  value={selectedRevision}
                  onChange={(e) => setSelectedRevision(e.target.value)}
                  disabled={plansLoading}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">
                    {plansLoading
                      ? "Loading options..."
                      : "No revision (default)"}
                  </option>

                  <option value="custom">Custom Pattern</option>

                  {revisionPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                      {plan.revisionDaysPattern
                        ? ` (${plan.revisionDaysPattern})`
                        : ""}
                    </option>
                  ))}
                </select>
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
                    className="w-full h-12 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <p className="text-xs text-slate-500">
                    Enter revision days between 1–15
                  </p>
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
