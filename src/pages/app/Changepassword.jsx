import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiFetch";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Confirm password must match new password");
      return;
    }

    const loadingToast = toast.loading("Updating password...");

    try {
      setLoading(true);

      const data = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      toast.dismiss(loadingToast);
      toast.success(data.message || "Password changed successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});

      // ✅ logout after successful password change
      localStorage.removeItem("accessToken");
      window.dispatchEvent(new CustomEvent("logout"));
    } catch (err) {
      toast.dismiss(loadingToast);

      if (err?.data?.newPassword) {
        setErrors({ newPassword: err.data.newPassword });
      }

      toast.error(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-28">
      <div className="w-full max-w-xl rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-white">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Change Password
            </h1>
            <p className="text-sm text-gray-500">
              Update your password securely
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="currentPassword"
              className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Current Password
            </label>

            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-4 pr-12 outline-none"
                placeholder="Enter current password"
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: "" }));
                }}
                className={`w-full rounded-2xl border px-4 py-4 pr-12 outline-none bg-white dark:bg-zinc-900 ${
                  errors.newPassword
                    ? "border-red-500"
                    : "border-gray-200 dark:border-zinc-700"
                }`}
                placeholder="Enter new password"
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-4 pr-12 outline-none"
                placeholder="Confirm new password"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-amber-400 text-white py-4 font-semibold disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
