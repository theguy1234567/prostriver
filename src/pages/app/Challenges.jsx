import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import ActiveChallengeCard from "../../components/app_components/challenges/ActiveChallengeCard";
import ChallengeCard from "../../components/app_components/challenges/ChallengeCard";
import ConfirmModal from "../../components/app_components/common/ConfirmModal";

export default function Challenges() {
  const [challenge, setChallenge] = useState(null);
  const [plans, setPlans] = useState([]);
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const getMyChallenge = async () => {
    try {
      const data = await apiFetch("/api/challenges/me");
      setChallenge(data);
    } catch (err) {
      if (err?.status === 404) {
        setChallenge(null);
      } else {
        console.error("Challenge fetch error:", err);
      }
    }
  };

  const getPlans = async () => {
    try {
      const data = await apiFetch("/api/challenges/plans");
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Plans fetch error:", err);
      setPlans([]);
    }
  };

  const getTodayRevisions = async () => {
    try {
      const data = await apiFetch("/api/topics/revisions/today");
      setTodayRevisions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Revisions fetch error:", err);
      setTodayRevisions([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.allSettled([
          getMyChallenge(),
          getPlans(),
          getTodayRevisions(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const getDaysLeft = () => {
    if (!challenge?.endDate) return 0;

    const end = new Date(challenge.endDate);
    const today = new Date();

    return Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
  };

  const formatChallengeType = (type) => {
    if (!type) return "Unknown";
    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleStart = async (type) => {
    try {
      await apiFetch("/api/challenges/select", {
        method: "POST",
        body: JSON.stringify({ challengeType: type }),
      });

      await Promise.all([getMyChallenge(), getTodayRevisions()]);
    } catch (err) {
      console.error("Start challenge error:", err);
      alert(err.message || "Failed to start challenge");
    }
  };

  // ✅ opens modal only
  const handleQuit = () => {
    setShowQuitConfirm(true);
  };

  // ✅ actual API quit
  const confirmQuitChallenge = async () => {
    try {
      await apiFetch("/api/challenges/me/quit", {
        method: "POST",
      });

      setChallenge(null);
      setTodayRevisions([]);
      setShowQuitConfirm(false);
      await getPlans();
    } catch (err) {
      console.error("Quit challenge error:", err);
      alert(err.message || "Failed to quit challenge");
    }
  };

  if (loading) {
    return (
      <p className="p-5 text-gray-500 dark:text-zinc-300">
        Loading challenges...
      </p>
    );
  }

  return (
    <div className="p-4 pb-32 z-0 font-averaiserif sm:p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-6xl font-bold text-center text-zinc-900 dark:text-white">
        Lock In With a Challenge
      </h1>

      {challenge && (
        <ActiveChallengeCard
          challenge={challenge}
          todayRevisions={todayRevisions}
          onQuit={handleQuit}
        />
      )}

      {challenge && (
        <>
          <div className="grid sm:grid-cols-1 lg:grid-cols-4 gap-4">
            <InfoCard
              label="Challenge Type"
              value={formatChallengeType(challenge.challengeType)}
            />
            <InfoCard
              label="Duration"
              value={`${challenge.durationDays} days`}
            />
            <InfoCard label="Started" value={challenge.startDate} />
            <InfoCard label="Ends" value={challenge.endDate} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard label="Freeze Allowed" value={challenge.freezeAllowed} />
            <InfoCard label="Freeze Used" value={challenge.freezeUsed} />
            <InfoCard
              label="Freeze Remaining"
              value={challenge.freezeRemaining}
            />
            <InfoCard
              label="Status"
              value={
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    challenge.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  {challenge.status}
                </span>
              }
            />
          </div>

          <div className="rounded-2xl border p-5 bg-white dark:bg-[#1E293B]">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Time Remaining
            </p>
            <h2 className="text-3xl font-bold mt-1 text-zinc-900 dark:text-white">
              {getDaysLeft()} days left
            </h2>
          </div>
        </>
      )}

      {!challenge && (
        <div>
          {plans.length === 0 ? (
            <p className="text-gray-500 dark:text-zinc-400">
              No challenges available right now.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-5">
              {plans.map((plan) => (
                <ChallengeCard
                  key={plan.type}
                  plan={plan}
                  onStart={handleStart}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ Confirm Quit Modal */}
      <ConfirmModal
        isOpen={showQuitConfirm}
        title="Quit Challenge?"
        message="This will stop your current streak and challenge progress."
        confirmText="Quit"
        onCancel={() => setShowQuitConfirm(false)}
        onConfirm={confirmQuitChallenge}
      />
    </div>
  );
}

const InfoCard = ({ label, value }) => (
  <div className="flex flex-col gap-2 bg-white rounded-2xl border p-4 dark:bg-[#1E293B]">
    <p className="text-sm text-gray-500 dark:text-zinc-400">{label}</p>
    <div className="text-2xl font-semibold text-zinc-900 dark:text-white break-words">
      {value}
    </div>
  </div>
);
