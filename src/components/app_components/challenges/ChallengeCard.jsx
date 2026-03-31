import React from "react";
import { HandMetal } from "lucide-react";

export default function ChallengeCard({ plan, onStart }) {
  const formattedType = plan.type?.toLowerCase().replaceAll("_", " ");

  return (
    <div className="bg-white dark:bg-zinc-900 flex justify-between items-center rounded-2xl shadow p-6 space-y-4">
      <div>
        <h3 className="text-5xl text-shadow-lg font-garamound  capitalize">
          {formattedType}
        </h3>

        <p className="text-2xl font-garamound text-gray-500">
          Duration: {plan.durationDays} days
        </p>

        <p className="text-sm font-garamound text-gray-500">
          Freeze Allowed: {plan.freezeAllowed}
        </p>
      </div>

      <button
        onClick={() => onStart(plan.type)}
        className=" h-10 w-10 font-averaiserif text-black sm:w-35 sm:h-35  flex items-center justify-center  bg-amber-300 hover:bg-amber-500 transition duration-700 ease-in-out  rounded-full"
      >
        <HandMetal />
      </button>
    </div>
  );
}
