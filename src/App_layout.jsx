import React from "react";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import App_nav from "./components/app_components/App_nav";

export default function App_layout() {
  const [showAddTopic, setShowAddTopic] = useState(false);

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
          <Outlet context={{ showAddTopic, setShowAddTopic }} />
        </div>
      </main>
    </div>
  );
}
