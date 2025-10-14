import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function ProfilesManager({ token, onSelectProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileBg, setNewProfileBg] = useState("#ffffff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProfiles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/user/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles(data.profiles);
      } else {
        setError(data.message || "Failed to fetch profiles");
      }
    } catch (e) {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const createProfile = async () => {
    if (!newProfileName.trim()) {
      setError("Profile name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/user/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newProfileName, backgroundPreference: newProfileBg }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles([...profiles, data.profile]);
        setNewProfileName("");
        setNewProfileBg("#ffffff");
      } else {
        setError(data.message || "Failed to create profile");
      }
    } catch (e) {
      setError("Network error");
    }
    setLoading(false);
  };

  const deleteProfile = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/user/profiles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles(profiles.filter((p) => p._id !== id));
      } else {
        setError(data.message || "Failed to delete profile");
      }
    } catch (e) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#222", color: "#fff", borderRadius: 12, maxWidth: 400, margin: "auto" }}>
      <h2>Manage Profiles</h2>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      <div>
        {profiles.map((profile) => (
          <div key={profile._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, backgroundColor: profile.backgroundPreference, padding: 8, borderRadius: 8, cursor: "pointer" }}
            onClick={() => onSelectProfile(profile)}
          >
            <span>{profile.name}</span>
            <button onClick={(e) => { e.stopPropagation(); deleteProfile(profile._id); }} style={{ backgroundColor: "red", color: "#fff", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}>
              Delete
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="New profile name"
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 8, border: "none", marginBottom: 8 }}
          disabled={loading}
        />
        <input
          type="color"
          value={newProfileBg}
          onChange={(e) => setNewProfileBg(e.target.value)}
          style={{ width: "100%", height: 40, border: "none", borderRadius: 8, marginBottom: 8 }}
          disabled={loading}
        />
        <button onClick={createProfile} disabled={loading} style={{ width: "100%", padding: 10, borderRadius: 8, backgroundColor: "#00f0ff", color: "#000", fontWeight: "bold", cursor: "pointer" }}>
          {loading ? "Saving..." : "Add Profile"}
        </button>
      </div>
    </div>
  );
}
