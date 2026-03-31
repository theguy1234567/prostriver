import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import App_nav from "./components/app_components/App_nav.jsx";
import AddTopicForm from "./pages/models/AddTopicForm.jsx";

export default function App_layout() {
  const [showAddTopic, setShowAddTopic] = useState(false);

  const closeModal = () => setShowAddTopic(false);

  const refreshTopics = async () => {
    window.dispatchEvent(new CustomEvent("refreshTopics"));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 transition-colors duration-300">
      <App_nav onOpenAddTopic={() => setShowAddTopic(true)} />

      <main
        className="
          pt-20 sm:pt-24
          pb-20 sm:pb-6
          px-4 sm:px-8
        "
      >
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      {/* ✅ GLOBAL ADD TOPIC MODAL */}
      {showAddTopic && (
        <AddTopicForm closeModal={closeModal} refreshTopics={refreshTopics} />
      )}
    </div>
  );
}
