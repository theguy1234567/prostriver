import React from "react";

export default function ChallengeCard({ plan, onStart }) {
  const formattedType = plan.type?.toLowerCase().replaceAll("_", " ");

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold capitalize">{formattedType}</h3>

      <p className="text-sm text-gray-500">
        Duration: {plan.durationDays} days
      </p>

      <p className="text-sm text-gray-500">
        Freeze Allowed: {plan.freezeAllowed}
      </p>

      <button
        onClick={() => onStart(plan.type)}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl"
      >
        Start Challenge
      </button>
    </div>
  );
}
