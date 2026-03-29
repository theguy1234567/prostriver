// components/revisions/RevisionList.jsx
import RevisionCard from "./RevisionCard.jsx";

export default function RevisionList({ revisions, refresh }) {
  if (revisions.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        🎉 No revisions for today!
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {revisions.map((rev) => (
        <RevisionCard
          key={rev.revisionScheduleId}
          revision={rev}
          refresh={refresh}
        />
      ))}
    </div>
  );
}
