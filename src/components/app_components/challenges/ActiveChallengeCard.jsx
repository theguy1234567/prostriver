import React from "react";
import { Rocket, CircleCheckBig, AlertCircle } from "lucide-react";

export default function ActiveChallengeCard({
  challenge,
  todayRevisions,
  onQuit,
}) {
  const progress = Number(challenge.progressPercent || 0);
  const formattedProgress = progress.toFixed(1);
  const completionRate = Number(challenge.completionRate || 0).toFixed(2);

  const hasRevisionsToday = todayRevisions.length > 0;
  const Show_message =
    progress > 0 || formattedProgress > 0 || completionRate > 0
      ? "you are rocking it today"
      : "Lets get started with your revision!";

  const formattedType = challenge.challengeType
    ?.toLowerCase()
    .replaceAll("_", " ");

  let message = "";
  let MessageIcon = CircleCheckBig;

  if (!hasRevisionsToday) {
    message = "You're on track today!";
    MessageIcon = CircleCheckBig;
  } else {
    message = "Complete today's revisions to keep your streak!";
    MessageIcon = AlertCircle;
  }

  return (
    <div className="bg-white relative dark:bg-zinc-900 rounded-2xl shadow p-4 sm:p-6 space-y-5 overflow-hidden">
      {/* TITLE */}
      <h2 className="text-2xl sm:text-3xl font-bold font-averaiserif flex items-center gap-2 text-zinc-900 dark:text-white">
        <Rocket size={20} />
        Active Challenge
      </h2>

      {/* MESSAGE */}
      <p className="font-averaiserif font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
        {Show_message}
      </p>

      <p className="text-sm text-gray-500 dark:text-zinc-400 capitalize break-words">
        {formattedType}
      </p>

      {/* DAILY STATUS */}
      <div className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-sm flex items-center gap-2 text-zinc-800 dark:text-white">
        <MessageIcon size={16} className="shrink-0" />
        <span className="break-words">{message}</span>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl sm:text-3xl font-averaiserif flex items-center justify-center gap-1 text-zinc-900 dark:text-white">
            🔥
            {challenge.currentStreak}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Streak</p>
        </div>

        <div>
          <p className="text-2xl sm:text-3xl font-averaiserif font-bold flex items-center justify-center gap-1 text-zinc-900 dark:text-white">
            📈
            {formattedProgress}%
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Progress</p>
        </div>

        <div>
          <p className="text-2xl sm:text-3xl font-averaiserif font-bold flex items-center justify-center gap-1 text-zinc-900 dark:text-white">
            ❄️
            {challenge.freezeRemaining}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Freeze Left
          </p>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* DETAILS */}
      {/* <div className="text-sm text-gray-500 dark:text-zinc-400 flex flex-col sm:flex-row sm:justify-between gap-1">
        <span>
          Day {challenge.currentStreak} / {challenge.durationDays}
        </span>
        <span>Rate: {completionRate}</span>
      </div> */}

      {/* FREEZE INFO */}
      <div className="text-sm sm:text-2xl text-gray-400 dark:text-zinc-500 leading-relaxed">
        You can miss {challenge.freezeRemaining} days without breaking your
        streak.
      </div>

      {/* DATES */}
      <div className="text-sm sm:text-xl text-gray-400 dark:text-zinc-500 flex flex-col sm:flex-row sm:justify-between gap-1">
        <span className="break-words">Start: {challenge.startDate}</span>
        <span className="break-words">End: {challenge.endDate}</span>
      </div>

      {/* QUIT */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onQuit}
          className="w-full sm:w-auto bg-gray-500/50 hover:bg-red-600 text-white py-2 px-4 rounded-xl transition duration-300"
        >
          Quit Challenge
        </button>
      </div>
    </div>
  );
}
