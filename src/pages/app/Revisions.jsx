import { useEffect, useState } from "react";
import { Archive, PartyPopper } from "lucide-react";
import RevisionList from "../../components/app_components/revisoncomponents/RevisionList";
import { apiFetch } from "../../utils/apiFetch";
import ConfirmModal from "../../components/app_components/common/ConfirmModal";
export default function Revisions() {
  const [revisions, setRevisions] = useState([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [archivingId, setArchivingId] = useState(null);

  // staggered animation states
  const [todayIn, setTodayIn] = useState(false);
  const [upcomingIn, setUpcomingIn] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      setError(null);

      const [todayData, upcomingData] = await Promise.all([
        apiFetch("/api/topics/revisions/today"),
        apiFetch("/api/topics/revisions/upcoming"),
      ]);

      setRevisions(Array.isArray(todayData) ? todayData : []);

      setUpcomingRevisions(
        Array.isArray(upcomingData)
          ? upcomingData
              .filter((rev) => !rev.status || rev.status === "PENDING")
              .sort(
                (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate),
              )
          : [],
      );
    } catch (err) {
      console.error("❌ Failed to fetch revisions:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedTopicId) return;

    try {
      setArchivingId(selectedTopicId);

      await apiFetch(`/api/topics/${selectedTopicId}/archive`, {
        method: "POST",
      });

      await fetchRevisions();
      setShowArchiveConfirm(false);
      setSelectedTopicId(null);
    } catch (err) {
      console.error("❌ Archive failed:", err);
      setError(err.message || "Failed to archive topic");
    } finally {
      setArchivingId(null);
    }
  };

  useEffect(() => {
    fetchRevisions();

    const timer1 = setTimeout(() => setTodayIn(true), 120);
    const timer2 = setTimeout(() => setUpcomingIn(true), 320);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="p-5 space-y-8 min-h-screen text-black dark:text-white">
      {/* TODAY
      <div
        className={`transition-all duration-700 ${
          todayIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <h1 className="text-2xl font-bold mb-4 font-averaiserif">
          Today's Revisions
        </h1>

        {loading && <p className="text-gray-500">Loading...</p>}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && revisions.length > 0 ? (
          <RevisionList revisions={revisions} refresh={fetchRevisions} />
        ) : (
          !loading && (
            <p className="text-gray-500 dark:text-gray-400">
              No revisions today
              <PartyPopper className="inline-block ml-2 mb-1" />
            </p>
          )
        )}
      </div> */}

      {/* UPCOMING */}
      {!loading && !error && (
        <div
          className={`transition-all duration-700 ${
            upcomingIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <h2 className="text-xl font-bold mb-4 font-averaiserif">
            Upcoming Revisions
          </h2>

          {upcomingRevisions.length > 0 ? (
            <div className="space-y-3">
              {upcomingRevisions.slice(0, 10).map((rev) => (
                <div
                  key={rev.revisionScheduleId}
                  className="p-4 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white dark:bg-[#1E293B] shadow"
                >
                  <div className="font-averaiserif text-black dark:text-white min-w-0 flex-1">
                    <p className="text-lg sm:text-2xl break-words leading-snug">
                      {rev.title}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                      {rev.subject} • Day {rev.dayNumber}
                    </p>

                    {rev.status && (
                      <p className="text-xs text-blue-400 mt-1 break-words">
                        {rev.status}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                    <p className="text-xs font-serif text-gray-400 break-words">
                      {rev.scheduledDate}
                    </p>

                    <button
                      onClick={() => {
                        setSelectedTopicId(rev.topicId);
                        setShowArchiveConfirm(true);
                      }}
                      disabled={archivingId === rev.topicId}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-300 hover:bg-amber-400 transition font-medium text-black disabled:opacity-50 whitespace-nowrap"
                    >
                      <Archive size={16} />
                      {archivingId === rev.topicId ? "Archiving..." : "Archive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming revisions
            </p>
          )}
        </div>
      )}
      <ConfirmModal
        isOpen={showArchiveConfirm}
        title="Archive Topic?"
        message="This topic will be archived and removed from active revisions."
        confirmText="Archive"
        onCancel={() => {
          setShowArchiveConfirm(false);
          setSelectedTopicId(null);
        }}
        onConfirm={handleArchive}
      />
    </div>
  );
}
