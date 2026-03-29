import React from "react";

export default function ActiveChallengeCard({
  challenge,
  todayRevisions,
  onQuit,
}) {
  const progress = Number(challenge.progressPercent || 0).toFixed(1);
  const completionRate = Number(challenge.completionRate || 0).toFixed(2);

  const hasRevisionsToday = todayRevisions.length > 0;

  const formattedType = challenge.challengeType
    ?.toLowerCase()
    .replaceAll("_", " ");

  let message = "";
  if (!hasRevisionsToday) {
    message = "🟢 You're on track today!";
  } else {
    message = "🔴 Complete today's revisions to keep your streak!";
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6 space-y-5">
      <h2 className="text-xl font-semibold">Active Challenge 🚀</h2>

      <p className="text-sm text-gray-500 capitalize">{formattedType}</p>

      {/* DAILY STATUS */}
      <div className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-sm">
        {message}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold">🔥 {challenge.currentStreak}</p>
          <p className="text-xs text-gray-500">Streak</p>
        </div>

        <div>
          <p className="text-lg font-bold">📈 {progress}%</p>
          <p className="text-xs text-gray-500">Progress</p>
        </div>

        <div>
          <p className="text-lg font-bold">❄️ {challenge.freezeRemaining}</p>
          <p className="text-xs text-gray-500">Freeze Left</p>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* DETAILS */}
      <div className="text-sm text-gray-500 flex justify-between">
        <span>
          Day {challenge.currentStreak} / {challenge.durationDays}
        </span>
        <span>Rate: {completionRate}</span>
      </div>

      {/* FREEZE INFO */}
      <div className="text-xs text-gray-400">
        You can miss {challenge.freezeRemaining} days without breaking your
        streak.
      </div>

      {/* DATES */}
      <div className="text-xs text-gray-400 flex justify-between">
        <span>Start: {challenge.startDate}</span>
        <span>End: {challenge.endDate}</span>
      </div>

      {/* QUIT */}
      <button
        onClick={onQuit}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl"
      >
        Quit Challenge
      </button>
    </div>
  );
}
