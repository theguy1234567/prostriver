import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Bell,
  CalendarDays,
  LogOut,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { apiFetch } from "../../utils/apiFetch";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({
    fullName: "",
    notificationPreference: "EMAIL",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/api/users/me");

      setProfile(data);
      setEditData({
        fullName: data?.fullName || "",
        notificationPreference: data?.notificationPreference || "EMAIL",
      });
    } catch (err) {
      console.error("Profile fetch failed:", err);
      setError("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const updated = await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(editData),
      });

      setProfile(updated);
      setEditMode(false);
    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      fullName: profile?.fullName || "",
      notificationPreference: profile?.notificationPreference || "EMAIL",
    });

    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-24 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-72 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="lg:col-span-2 h-72 rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 text-zinc-900 dark:text-white">
      {/* Hero */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Your Account
            </p>
            <h1 className="text-3xl md:text-4xl font-garamound">
              Profile Settings
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              Manage your personal information and preferences.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 self-start md:self-auto text-center   rounded-full bg-amber-300 px-6 py-3 text-zinc-900 font-garamound hover:bg-amber-400 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Profile Card */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <User size={36} />
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              {profile?.fullName || "Unnamed User"}
            </h2>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 break-all">
              {profile?.email}
            </p>

            <div className="mt-6 w-full rounded-3xl bg-zinc-50 dark:bg-zinc-800 p-4">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                <CalendarDays size={16} />
                Member Since
              </div>
              <p className="mt-2 font-medium">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Settings */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <User size={16} />
                Full Name
              </label>

              {editMode ? (
                <input
                  type="text"
                  name="fullName"
                  value={editData.fullName}
                  onChange={handleChange}
                  className="w-full mt-2 rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
                />
              ) : (
                <p className="mt-2 text-lg">{profile?.fullName || "Not set"}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Mail size={16} />
                Email
              </label>
              <p className="mt-2">{profile?.email}</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Bell size={16} />
                Notification Preference
              </label>

              {editMode ? (
                <select
                  name="notificationPreference"
                  value={editData.notificationPreference}
                  onChange={handleChange}
                  className="w-full mt-2 rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
                >
                  <option value="EMAIL">Email</option>
                  <option value="NONE">None</option>
                </select>
              ) : (
                <p className="mt-2">
                  {profile?.notificationPreference === "NONE"
                    ? "None"
                    : "Email"}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-6 py-3 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 font-medium hover:opacity-90 transition"
              >
                <Pencil size={18} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// 