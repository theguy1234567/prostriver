import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function AddTopicForm({
  closeModal,
  editingTopic,
  refreshTopics,
}) {
  const [title, setTitle] = useState(editingTopic?.title || "");
  const [subject, setSubject] = useState(editingTopic?.subject || "");
  const [notes, setNotes] = useState(editingTopic?.notes || "");

  const [revisionPlanId, setRevisionPlanId] = useState("");
  const [manualPattern, setManualPattern] = useState("");

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const isEdit = !!editingTopic;

  // ✅ fetch revision plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/admin/revision-plans", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        setPlans(data);
      } catch {}
    };

    fetchPlans();
  }, []);

  // ✅ ESC close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeModal]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !subject.trim()) {
      toast.error("Title and Subject are required");
      return;
    }

    // ❗ rule: only one allowed
    if (revisionPlanId && manualPattern) {
      toast.error("Choose either plan OR manual pattern");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/topics/${editingTopic.id}` : `/api/topics`;

      const method = isEdit ? "PATCH" : "POST";

      const body = {
        title,
        subject,
        notes,
      };

      if (!isEdit) {
        if (revisionPlanId) body.revisionPlanId = revisionPlanId;
        if (manualPattern) body.manualReminderPattern = manualPattern;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (typeof data === "object" && !data.message) {
          throw new Error(Object.values(data)[0]);
        }
        throw new Error(data.message);
      }

      toast.success(isEdit ? "Updated" : "Added");

      refreshTopics();
      closeModal();
    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed h-screen w-screen inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100]"
    >
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl w-full max-w-lg relative fade-up">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit Topic" : "Add Topic"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-2 rounded bg-gray-100 dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-amber-400 outline-none"
          />

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full p-2 rounded bg-gray-100 dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-amber-400 outline-none"
          />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="w-full p-2 rounded bg-gray-100 dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-amber-400 outline-none"
          />

          {/* 🔥 Revision Plan */}
          {!isEdit && (
            <>
              <select
                value={revisionPlanId}
                onChange={(e) => {
                  setRevisionPlanId(e.target.value);
                  setManualPattern("");
                }}
                className="w-full p-2 rounded bg-gray-100 dark:bg-zinc-800"
              >
                <option value="">No Revision</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.revisionDaysPattern})
                  </option>
                ))}
              </select>

              <input
                value={manualPattern}
                onChange={(e) => {
                  setManualPattern(e.target.value);
                  setRevisionPlanId("");
                }}
                placeholder="Custom pattern (e.g. 1,4,7)"
                className="w-full p-2 rounded bg-gray-100 dark:bg-zinc-800"
              />
            </>
          )}

          <button
            disabled={loading}
            className="w-full bg-amber-400 py-2 rounded hover:bg-amber-500 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
