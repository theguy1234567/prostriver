import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState("");
  const [editData, setEditData] = useState({
    fullName: "",
    notificationPreference: "EMAIL",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 🔹 Fetch Profile
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await res.json();
      setProfile(data);
      setEditData({
        fullName: data.fullName || "",
        notificationPreference: data.notificationPreference || "EMAIL",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔹 Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Save Changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();
      setProfile(data);
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading profile...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 🟦 Profile Info Card */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">User Info</h2>

          {/* Full Name */}
          <div className="mb-4">
            <label className="text-sm text-gray-400">Full Name</label>
            {editMode ? (
              <input
                type="text"
                name="fullName"
                value={editData.fullName}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700"
              />
            ) : (
              <p className="mt-1">{profile.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm text-gray-400">Email</label>
            <p className="mt-1">{profile.email}</p>
          </div>

          {/* Created At */}
          <div className="mb-4">
            <label className="text-sm text-gray-400">Joined</label>
            <p className="mt-1">
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Notification Preference */}
          <div className="mb-4">
            <label className="text-sm text-gray-400">
              Notification Preference
            </label>

            {editMode ? (
              <select
                name="notificationPreference"
                value={editData.notificationPreference}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700"
              >
                <option value="EMAIL">Email</option>
                <option value="NONE">None</option>
              </select>
            ) : (
              <p className="mt-1">{profile.notificationPreference}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* 🟨 Extra Card (Future Ready) */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Account Settings</h2>

          <button
            className="w-full bg-red-600 py-2 rounded hover:bg-red-700"
            onClick={async () => {
              await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
              });
              localStorage.removeItem("accessToken");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
