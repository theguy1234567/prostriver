import { useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      setMessage(res.message || "Password reset successful");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-3xl font-garamound text-zinc-900 dark:text-white">
          Reset Password
        </h1>

        <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
          Enter the OTP sent to your email.
        </p>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-300 dark:border-green-500/30 px-4 py-3 text-sm text-green-600 dark:text-green-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-zinc-500 dark:text-zinc-400">
              OTP
            </label>
            <div className="mt-2 relative">
              <KeyRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-4 py-3 outline-none focus:border-zinc-500 text-zinc-900 dark:text-white"
                placeholder="Enter 6-digit OTP"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-500 dark:text-zinc-400">
              New Password
            </label>
            <div className="mt-2 relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-4 py-3 outline-none focus:border-zinc-500 text-zinc-900 dark:text-white"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
