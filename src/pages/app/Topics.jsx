import React, { useEffect, useState } from "react";

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const [editingTopic, setEditingTopic] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("accessToken");

  const buildUrl = () => {
    let url = `${API_BASE}/api/topics?`;

    if (search.trim()) url += `q=${encodeURIComponent(search)}&`;
    if (filter) url += `status=${filter}&`;

    return url;
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setTopics(data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchTopics, 400);
    return () => clearTimeout(delay);
  }, [filter, search]);

  // 🔥 FIXED UPDATE (ONLY SEND CHANGED FIELDS)
  const handleUpdate = async () => {
    try {
      const payload = {};

      if (editingTopic.title?.trim()) payload.title = editingTopic.title;
      if (editingTopic.subject?.trim()) payload.subject = editingTopic.subject;
      if (editingTopic.notes !== undefined) payload.notes = editingTopic.notes;

      await fetch(`${API_BASE}/api/topics/${editingTopic.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setEditingTopic(null);
      fetchTopics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id) => {
    await fetch(`${API_BASE}/api/topics/${id}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTopics();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this topic permanently?")) return;

    await fetch(`${API_BASE}/api/topics/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTopics();
  };

  const statusStyles = {
    ACTIVE: "bg-green-100 text-green-700",
    LEARNED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-purple-100 text-purple-700",
    ARCHIVED: "bg-gray-200 text-gray-700",
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-between">
        <input
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="LEARNED">Learned</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {topics.map((topic) => (
        <div
          key={topic.id}
          className="p-4 bg-white rounded shadow flex justify-between"
        >
          <div>
            <h3 className="font-bold">{topic.title}</h3>
            <p className="text-sm">{topic.subject}</p>

            <span
              className={`text-xs px-2 py-1 rounded ${statusStyles[topic.status]}`}
            >
              {topic.status}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setEditingTopic(topic)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>

            {topic.status !== "ARCHIVED" && (
              <button
                onClick={() => handleArchive(topic.id)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Archive
              </button>
            )}

            <button
              onClick={() => handleDelete(topic.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {editingTopic && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-xl font-semibold">Edit Topic</h2>

            <input
              value={editingTopic.title}
              onChange={(e) =>
                setEditingTopic({ ...editingTopic, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Title"
            />

            <input
              value={editingTopic.subject}
              onChange={(e) =>
                setEditingTopic({ ...editingTopic, subject: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Subject"
            />

            <textarea
              value={editingTopic.notes || ""}
              onChange={(e) =>
                setEditingTopic({ ...editingTopic, notes: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Notes"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingTopic(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
