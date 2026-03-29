import React from "react";
import { Outlet } from "react-router-dom";
import App_nav from "./components/app_components/App_nav";

export default function App_layout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 transition-colors duration-300">
      {/* 🔹 Navbar */}
      <App_nav />

      {/* 🔹 Main Content */}
      <main
        className="
          pt-20 sm:pt-24   /* space for top nav */
          pb-20 sm:pb-6    /* space for bottom nav */
          px-4 sm:px-8
          
        "
      >
        <div className="w-full ">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
