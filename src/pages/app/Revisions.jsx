// pages/Revisions.jsx
import { useEffect, useState } from "react";
import RevisionList from "../../components/app_components/revisoncomponents/RevisionList";

export default function Revisions() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRevisions = async () => {
    try {
      const res = await fetch("/api/topics/revisions/today", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await res.json();
      setRevisions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Today's Revisions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <RevisionList revisions={revisions} refresh={fetchRevisions} />
      )}
    </div>
  );
}
