export default function StatsCards({ overview }) {
  if (!overview) return <p>Loading...</p>;

  const { revision } = overview;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card title="Completed" value={revision.completedMtd} />
      <Card title="Missed" value={revision.missedMtd} />
      <Card title="Rate" value={`${(revision.rateMtd * 100).toFixed(0)}%`} />
      <Card title="Month" value={`${revision.month}/${revision.year}`} />
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
