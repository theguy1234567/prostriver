export default function TodayRevisions({ revisions }) {
  const token = localStorage.getItem("accessToken");

  const markComplete = async (id) => {
    await fetch(`/api/topics/revisions/${id}/complete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    window.location.reload(); // simple refresh (optimize later)
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4">Today’s Revisions</h2>

      {revisions.length === 0 ? (
        <p className="text-gray-500">No revisions today 🎉</p>
      ) : (
        revisions.map((r) => (
          <div
            key={r.revisionScheduleId}
            className="flex justify-between items-center mb-3"
          >
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="text-sm text-gray-500">
                {r.subject} • Day {r.dayNumber}
              </p>
            </div>

            <button
              onClick={() => markComplete(r.revisionScheduleId)}
              className="px-3 py-1 bg-green-500 text-white rounded-lg"
            >
              Done
            </button>
          </div>
        ))
      )}
    </div>
  );
}
