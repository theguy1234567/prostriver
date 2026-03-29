import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import ActiveChallengeCard from "../../components/app_components/challenges/ActiveChallengeCard";
import ChallengeCard from "../../components/app_components/challenges/ChallengeCard";

export default function Challenges() {
  const [challenge, setChallenge] = useState(null);
  const [plans, setPlans] = useState([]);
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Get active challenge
  const getMyChallenge = async () => {
    try {
      const data = await apiFetch("/api/challenges/me");
      setChallenge(data);
    } catch (err) {
      if (err?.status === 404 || err?.message?.includes("No ACTIVE")) {
        setChallenge(null);
      } else {
        console.error(err);
      }
    }
  };

  // 🔹 Get plans
  const getPlans = async () => {
    try {
      const data = await apiFetch("/api/challenges/plans");
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPlans([]);
    }
  };

  // 🔹 Get today's revisions
  const getTodayRevisions = async () => {
    try {
      const data = await apiFetch("/api/topics/revisions/today");

      // IMPORTANT: assume backend may send mixed statuses
      const pendingOnly = (Array.isArray(data) ? data : []).filter(
        (r) => r.status === "PENDING",
      );

      setTodayRevisions(pendingOnly);
    } catch (err) {
      console.error(err);
      setTodayRevisions([]);
    }
  };

  // 🔹 Init
  useEffect(() => {
    const init = async () => {
      await Promise.all([getMyChallenge(), getPlans(), getTodayRevisions()]);
      setLoading(false);
    };
    init();
  }, []);

  // 🔹 Start challenge
  const handleStart = async (type) => {
    try {
      await apiFetch("/api/challenges/select", {
        method: "POST",
        body: JSON.stringify({ challengeType: type }),
      });

      await getMyChallenge();
      await getTodayRevisions();
    } catch (err) {
      alert(err.message || "Error starting challenge");
    }
  };

  // 🔹 Quit challenge
  const handleQuit = async () => {
    try {
      await apiFetch("/api/challenges/me/quit", {
        method: "POST",
      });

      setChallenge(null);
      setTodayRevisions([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p className="p-5 text-gray-500">Loading challenges...</p>;
  }

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Challenges</h1>

      {/* 🔥 ACTIVE */}
      {challenge && (
        <ActiveChallengeCard
          challenge={challenge}
          todayRevisions={todayRevisions}
          onQuit={handleQuit}
        />
      )}

      {/* 🎯 AVAILABLE */}
      {!challenge && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Challenges</h2>

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
