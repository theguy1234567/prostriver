import { useEffect, useState } from "react";
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

  // ✅ Fetch profile
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

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Save changes
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

  // ✅ Cancel editing
  const handleCancel = () => {
    setEditData({
      fullName: profile?.fullName || "",
      notificationPreference: profile?.notificationPreference || "EMAIL",
    });

    setEditMode(false);
  };

  // ✅ Logout
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

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="p-6 text-zinc-300">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-zinc-800 rounded" />
          <div className="h-72 bg-zinc-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 text-white">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Profile</h1>

      {/* ✅ Error Banner */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ✅ User Info */}
        <div className="bg-zinc-900 rounded-2xl p-5 md:p-6 border border-zinc-800 shadow-md">
          <h2 className="text-lg font-semibold mb-5">User Info</h2>

          {/* Full Name */}
          <div className="mb-5">
            <label className="text-sm text-zinc-400">Full Name</label>

            {editMode ? (
              <input
                type="text"
                name="fullName"
                value={editData.fullName}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500"
              />
            ) : (
              <p className="mt-2 text-zinc-100">
                {profile?.fullName || "Not set"}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="text-sm text-zinc-400">Email</label>
            <p className="mt-2 text-zinc-100 break-all">{profile?.email}</p>
          </div>

          {/* Joined */}
          <div className="mb-5">
            <label className="text-sm text-zinc-400">Joined</label>
            <p className="mt-2 text-zinc-100">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {/* Notification Preference */}
          <div className="mb-5">
            <label className="text-sm text-zinc-400">
              Notification Preference
            </label>

            {editMode ? (
              <select
                name="notificationPreference"
                value={editData.notificationPreference}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500"
              >
                <option value="EMAIL">Email</option>
                <option value="NONE">None</option>
              </select>
            ) : (
              <p className="mt-2 text-zinc-100">
                {profile?.notificationPreference === "NONE" ? "None" : "Email"}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 px-5 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={handleCancel}
                  className="bg-zinc-700 px-5 py-2.5 rounded-xl hover:bg-zinc-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ✅ Account Settings */}
        <div className="bg-zinc-900 rounded-2xl p-5 md:p-6 border border-zinc-800 shadow-md h-fit">
          <h2 className="text-lg font-semibold mb-5">Account Settings</h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-zinc-800 p-4">
              <p className="text-sm text-zinc-400 mb-1">Account Status</p>
              <p className="font-medium text-green-400">Active</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 py-3 rounded-xl hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
