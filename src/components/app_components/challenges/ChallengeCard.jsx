import React from "react";
import { HandMetal } from "lucide-react";

export default function ChallengeCard({ plan, onStart }) {
  const formattedType = plan.type?.toLowerCase().replaceAll("_", " ");

  return (
    <div className="bg-white dark:bg-zinc-900 dark:text-white rounded-2xl shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* LEFT CONTENT */}
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-garamound capitalize break-words leading-tight text-zinc-900 dark:text-white">
            {formattedType}
          </h3>

          <p className="text-base sm:text-xl font-garamound text-gray-500 dark:text-zinc-400 mt-2">
            Duration: {plan.durationDays} days
          </p>

          <p className="text-sm sm:text-base font-garamound text-gray-500 dark:text-zinc-400">
            Freeze Allowed: {plan.freezeAllowed}
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => onStart(plan.type)}
          className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 self-start sm:self-center font-averaiserif text-black flex items-center justify-center bg-amber-300 hover:bg-amber-500 transition duration-500 ease-in-out rounded-full"
        >
          <HandMetal size={22} className="sm:w-8 sm:h-8" />
        </button>
      </div>
    </div>
  );
}
