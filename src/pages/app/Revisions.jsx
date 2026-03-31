import { useEffect, useState } from "react";
import RevisionList from "../../components/app_components/revisoncomponents/RevisionList";
import { apiFetch } from "../../utils/apiFetch";

export default function Revisions() {
  const [revisions, setRevisions] = useState([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchRevisions();
  }, []);

  return (
    <div className="p-5 space-y-6">
      {/* TODAY */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Today's Revisions</h1>

        {loading && <p>Loading...</p>}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <RevisionList revisions={revisions} refresh={fetchRevisions} />
        )}
      </div>

      {/* UPCOMING */}
      {!loading && !error && (
        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming Revisions</h2>

          {upcomingRevisions.length > 0 ? (
            <div className="space-y-3">
              {upcomingRevisions.slice(0, 10).map((rev) => (
                <div
                  key={rev.revisionScheduleId}
                  className="p-4 rounded-xl flex justify-between items-center bg-white dark:bg-[#1E293B] shadow"
                >
                  <div className="font-averaiserif">
                    <p className="text-2xl">{rev.title}</p>

                    <p className="text-sm text-gray-500">
                      {rev.subject} • Day {rev.dayNumber}
                    </p>

                    {rev.status && (
                      <p className="text-xs text-blue-400 mt-1">{rev.status}</p>
                    )}
                  </div>

                  <p className="text-2xs font-serif text-gray-400 mt-1">
                    {rev.scheduledDate}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming revisions 🎉</p>
          )}
        </div>
      )}
    </div>
  );
}
