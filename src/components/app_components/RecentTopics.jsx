export default function RecentTopics({ topics }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4">Recent Topics</h2>

      {topics.length === 0 ? (
        <p>No topics yet</p>
      ) : (
        topics.map((t) => (
          <div key={t.id} className="mb-3">
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-gray-500">
              {t.subject} • {t.status}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
