import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import ActiveChallengeCard from "../../components/app_components/challenges/ActiveChallengeCard";
import ChallengeCard from "../../components/app_components/challenges/ChallengeCard";

export default function Challenges() {
  const [challenge, setChallenge] = useState(null);
  const [plans, setPlans] = useState([]);
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // API LOADERS
  // =========================
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

  // =========================
  // INITIAL LOAD
  // =========================
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

  // =========================
  // HELPERS
  // =========================
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

  // =========================
  // ACTIONS
  // =========================
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

  const handleQuit = async () => {
    try {
      await apiFetch("/api/challenges/me/quit", {
        method: "POST",
      });

      setChallenge(null);
      setTodayRevisions([]);
    } catch (err) {
      console.error("Quit challenge error:", err);
      alert(err.message || "Failed to quit challenge");
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <p className="p-5 text-gray-500">Loading challenges...</p>;
  }

  return (
    <div className="p-4   sm:p-6 max-w bg-green-800/10 rounded-full   mx-auto space-y-6">
      <h1 className="text-2xl font-averaiserif sm:text-6xl font-bold text-center">Lock In With a Challenge</h1>

      {/* ACTIVE CHALLENGE DETAILS */}
      {challenge && (
        <>
          {/* JOURNEY */}
          <div className="grid grid-cols-2  lg:grid-cols-4 gap-4">
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

          {/* FREEZE + STATUS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {challenge.status}
                </span>
              }
            />
          </div>

          {/* DAYS LEFT */}
          <div className="rounded-2xl border p-5 bg-white dark:bg-[#1E293B]">
            <p className="text-sm text-gray-500">Time Remaining</p>
            <h2 className="text-3xl font-bold mt-1">
              {getDaysLeft()} days left
            </h2>
          </div>

          {/* ACTIVE CARD */}
          <ActiveChallengeCard
            challenge={challenge}
            todayRevisions={todayRevisions}
            onQuit={handleQuit}
          />
        </>
      )}

      {/* AVAILABLE CHALLENGES */}
      {!challenge && (
        <div>
          

          {plans.length === 0 ? (
            <p className="text-gray-500">No challenges available right now.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
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
    </div>
  );
}

// =========================
// REUSABLE INFO CARD
// =========================
const InfoCard = ({ label, value }) => (
  <div className="rounded-2xl border p-4 bg-white dark:bg-[#1E293B]">
    <p className="text-sm text-gray-500">{label}</p>
    <div className="text-lg font-semibold mt-1">{value}</div>
  </div>
);
