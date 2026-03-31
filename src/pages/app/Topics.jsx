import React, { useEffect, useState } from "react";

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editingTopic, setEditingTopic] = useState(null);
  const [expandedTopicId, setExpandedTopicId] = useState(null);

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

  const handleUpdate = async () => {
    try {
      const payload = {};
      if (editingTopic.title?.trim()) payload.title = editingTopic.title;
      if (editingTopic.subject?.trim()) payload.subject = editingTopic.subject;
      payload.notes = editingTopic.notes || "";

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
    const confirmed = window.confirm(
      "Archive this topic?\n\nOnce archived, it cannot be edited later.",
    );
    if (!confirmed) return;

    try {
      await fetch(`${API_BASE}/api/topics/${id}/archive`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTopics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this topic permanently?")) return;
    await fetch(`${API_BASE}/api/topics/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTopics();
  };

  const statusStyles = {
    ACTIVE: "bg-[#06D6A0] text-white dark:bg-green-900/40 dark:text-green-300",
    LEARNED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    COMPLETED:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    ARCHIVED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-zinc-600 dark:text-zinc-300">
        Loading topics...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <input
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
        >
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="LEARNED">Learned</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id;

          return (
            <div
              key={topic.id}
              className="relative group p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div
                onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                className="flex flex-col sm:flex-row justify-between gap-4 cursor-pointer"
              >
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {topic.subject}
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${statusStyles[topic.status]}`}
                  >
                    {topic.status}
                  </span>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Plan ID:{" "}
                    {topic.revisionPlanId || topic.manualReminderPattern}
                  </p>
                </div>

                <div
                  className="flex items-center gap-2 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setEditingTopic(topic)}
                    className="px-4 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
                  >
                    Edit
                  </button>

                  {topic.status !== "ARCHIVED" && (
                    <button
                      onClick={() => handleArchive(topic.id)}
                      className="px-4 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition"
                    >
                      Archive
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="px-4 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="hidden lg:block absolute left-0 right-0 top-full mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Subject
                      </p>
                      <p className="text-zinc-900 dark:text-white">
                        {topic.subject}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Created
                      </p>
                      <p className="text-zinc-900 dark:text-white">
                        {topic.createdAt
                          ? new Date(topic.createdAt).toLocaleDateString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {topic.notes || "No notes added yet."}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`lg:hidden overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 mt-4" : "max-h-0"}`}
              >
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Created
                      </p>
                      <p className="text-zinc-900 dark:text-white">
                        {topic.createdAt
                          ? new Date(topic.createdAt).toLocaleDateString()
                          : "Not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 dark:text-zinc-400">Notes</p>
                      <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {topic.notes || "No notes added yet."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingTopic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 px-4">
          <div className="w-full max-w-lg rounded-3xl p-6 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                Edit Topic
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Update your topic details and notes.
              </p>
            </div>

            <div className="space-y-4">
              <input
                value={editingTopic.title}
                onChange={(e) =>
                  setEditingTopic({ ...editingTopic, title: e.target.value })
                }
                className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                placeholder="Topic title"
              />
              <input
                value={editingTopic.subject}
                onChange={(e) =>
                  setEditingTopic({ ...editingTopic, subject: e.target.value })
                }
                className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                placeholder="Subject"
              />
              <textarea
                value={editingTopic.notes || ""}
                onChange={(e) =>
                  setEditingTopic({ ...editingTopic, notes: e.target.value })
                }
                className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white min-h-[180px]"
                placeholder="Write notes here..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingTopic(null)}
                className="px-5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
