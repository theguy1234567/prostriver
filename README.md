# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


//Prostriver project
changed two new files from new machine
    protectedRoutes
    Public.jsx
    pull from main maching to keep updated










<!-- 
{/* TODAY REVISIONS */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B]">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar size={18} />
          Today's Revisions ({revisionLength})
        </h2>

        {revisions.length > 0 ? (
          revisions.map((r) => (
            <div
              key={r.revisionScheduleId}
              className="p-3 mb-2 rounded-lg bg-gray-100 dark:bg-[#0F172A] flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-gray-500">
                  {r.subject} • Day {r.dayNumber}
                </p>
              </div>
              <button
                onClick={() => navigate("/app/revisions")}
                className="px-3 py-1.5 rounded-full bg-amber-300 text-sm"
              >
                Go
              </button>
            </div>
          ))
        ) : (
          <p>No revisions today</p>
        )}
      </div>

      {/* TODAY Learnings */}
      <div className="p-4 relative rounded-2xl bg-white dark:bg-[#1E293B]">
        <div className="">
          <h2 className="text-2xl font-averaiserif mb-3 flex items-center gap-2">
            <BookOpen size={18} />
            Today’s Learnings ({todayTopics.length})
          </h2>
          <button
            onClick={() => {
              setEditingTopic(null);
              setShowModal(true);
            }}
            className="hidden sm:flex absolute top-2 right-3 items-center gap-2 bg-amber-300 px-4 py-2 rounded-full shadow"
          >
            <Plus size={16} />
            Add Topic
          </button>
        </div>

        {todayTopics.length > 0 ? (
          todayTopics.map((t) => (
            <div
              key={t.id}
              className="p-4 mb-3 rounded-2xl bg-gray-100 dark:bg-[#0F172A]"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.subject}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTopic(t);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 rounded-full text-xs bg-blue-500 text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this topic permanently?"))
                        return;
                      await apiFetch(`/api/topics/${t.id}`, {
                        method: "DELETE",
                      });
                      toast.success("Topic deleted");
                      loadDashboard();
                    }}
                    className="px-3 py-1 rounded-full text-xs bg-red-500 text-white"
                  >
                    Delete
                  </button>

                  <button
                    onClick={async () => {
                      setExpandedTopicId(t);

                      if (t.revisionPlanId) {
                        try {
                          const plan = await apiFetch(
                            `/api/admin/revision-plans/${t.revisionPlanId}`,
                          );
                          setRevisionPlanDetails(plan);
                        } catch {
                          setRevisionPlanDetails(null);
                        }
                      } else {
                        setRevisionPlanDetails(null);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#1E293B]"
                  >
                    ⋯
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No topics added today</p>
        )}
      </div>

      {showModal && (
        <AddTopicForm
          closeModal={() => setShowModal(false)}
          editingTopic={editingTopic}
          refreshTopics={loadDashboard}
        />
      )}

      {expandedTopicId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold font-averaiserif">
                  {expandedTopicId.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {expandedTopicId.subject}
                </p>
              </div>

              <button
                onClick={() => {
                  setExpandedTopicId(null);
                  setRevisionPlanDetails(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p>
                  {expandedTopicId.createdAt
                    ? new Date(expandedTopicId.createdAt).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Notes</p>
                <p>{expandedTopicId.notes || "No notes added yet."}</p>
              </div>

              <div>
                <p className="text-gray-500">Revision Plan</p>
                <p>
                  {revisionPlanDetails
                    ? `${revisionPlanDetails.name} (${revisionPlanDetails.revisionDaysPattern})`
                    : expandedTopicId.manualReminderPattern || "Manual"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div> -->