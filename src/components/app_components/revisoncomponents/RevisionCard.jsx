import { useState } from "react";

export default function RevisionCard({ revision, refresh }) {
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("accessToken");

  const handleComplete = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/topics/revisions/${revision.revisionScheduleId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed");

      refresh(); // reload list
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-sm flex justify-between items-center bg-white dark:bg-[#1E293B]">
      {/* LEFT */}
      <div>
        <p className="text-sm text-gray-500">{revision.subject}</p>

        <h2 className="font-semibold text-lg">{revision.title}</h2>

        <p className="text-xs text-gray-400">
          Day {revision.dayNumber} • {revision.scheduledDate}
        </p>
      </div>

      {/* RIGHT */}
      <button
        onClick={handleComplete}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-white transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "..." : "Done"}
      </button>
    </div>
  );
}
