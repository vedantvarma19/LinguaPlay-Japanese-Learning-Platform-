import { useState, useEffect } from "react";
import API from "../services/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const avatarList = ["🦊", "🐱", "🐯", "🐼", "🍣", "🍙", "🎋", "🏯", "🗻", "🥋"];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        const user = res.data.user;
        setProfile(user);
        setName(user.name);
        setEmail(user.email);
        setSelectedAvatar(user.avatar || "🦊");
      } catch (err) {
        console.error("Error fetching profile details:", err);
        setErrorMsg("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (password && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const updateData = { name, email, avatar: selectedAvatar };
      if (password) updateData.password = password;

      const res = await API.get("/progress");
      const currentProgress = res.data;

      const response = await API.put("/auth/profile", updateData);
      setProfile({
        ...response.data.user,
        xp: currentProgress.xp || 0,
        level: currentProgress.level || 1
      });

      localStorage.setItem("userName", response.data.user.name);
      localStorage.setItem("userAvatar", response.data.user.avatar);

      setSuccessMsg("Profile updated successfully! 🌸");
      setPassword("");
      setConfirmPassword("");

      // Dispatch custom event to notify Navbar
      window.dispatchEvent(new Event("updateUserStats"));
    } catch (err) {
      console.error("Profile update failed:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center fade-in-up">
        <div className="spinner-border text-purple" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading Profile...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving your learning metrics...</p>
      </div>
    );
  }

  // Calculate Level Progression
  const currentXp = profile?.xp || 0;
  const xpInCurrentLevel = currentXp % 100;
  const xpNeededForNextLevel = 100 - xpInCurrentLevel;
  const levelProgressPercent = xpInCurrentLevel;

  return (
    <div className="container py-5 fade-in-up">
      <h2 className="fw-bold mb-4 text-center text-gradient" style={{ background: "linear-gradient(45deg, #7f00ff, #e100ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        My Learning Dashboard 🌸
      </h2>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm rounded-4 mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg("")}></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm rounded-4 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg("")}></button>
        </div>
      )}

      <div className="row g-4">
        {/* LEFT COLUMN: LEARNING STATISTICS */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4 h-100" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f9f8ff 100%)" }}>
            {/* User Avatar Circle */}
            <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm border border-opacity-10 mx-auto mb-3" style={{ width: "110px", height: "110px", borderColor: "#8a2be2" }}>
              <span className="display-3">{selectedAvatar}</span>
            </div>

            <h4 className="fw-bold text-dark mb-1">{profile?.name}</h4>
            <p className="text-muted small mb-4">{profile?.email}</p>

            <hr className="border-secondary border-opacity-25 my-3" />

            {/* Streak & level Stats */}
            <div className="row g-2 mb-4">
              <div className="col-6">
                <div className="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3 h-100 d-flex flex-column justify-content-center">
                  <div className="display-6 text-warning mb-1">🔥</div>
                  <div className="fw-bold text-dark font-monospace" style={{ fontSize: "1.25rem" }}>{profile?.streak || 1}</div>
                  <span className="text-muted small">Daily Streak</span>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-purple bg-opacity-10 border border-purple border-opacity-25 rounded-3 h-100 d-flex flex-column justify-content-center" style={{ borderColor: "rgba(138, 43, 226, 0.25)" }}>
                  <div className="display-6 text-purple mb-1" style={{ color: "#8a2be2" }}>💎</div>
                  <div className="fw-bold text-dark font-monospace" style={{ fontSize: "1.25rem" }}>{profile?.xp || 0}</div>
                  <span className="text-muted small">Total XP</span>
                </div>
              </div>
            </div>

            {/* Level Card & Progress bar */}
            <div className="p-3 rounded-4 bg-white shadow-sm border border-light text-start mb-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge rounded-pill bg-purple text-white px-3 py-1.5 fw-bold bg-gradient" style={{ backgroundColor: "#8a2be2" }}>
                  Level {profile?.level || 1}
                </span>
                <span className="text-muted small font-monospace">{xpInCurrentLevel}/100 XP</span>
              </div>
              
              {/* Progress bar */}
              <div className="progress rounded-pill overflow-hidden shadow-none border border-light" style={{ height: "14px", backgroundColor: "#eef2f7" }}>
                <div 
                  className="progress-bar rounded-pill bg-gradient" 
                  role="progressbar" 
                  style={{ 
                    width: `${levelProgressPercent}%`,
                    background: "linear-gradient(90deg, #7f00ff, #e100ff)",
                    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} 
                  aria-valuenow={levelProgressPercent} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              <p className="text-muted small mt-2 mb-0 text-center">
                Gain <strong>{xpNeededForNextLevel} XP</strong> to reach Level {(profile?.level || 1) + 1}!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT PROFILE FORMS */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-pencil-square text-purple" style={{ color: "#8a2be2" }}></i> Edit Profile Info
            </h5>

            <form onSubmit={handleUpdateProfile}>
              {/* Profile details */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      id="profileName" 
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <label htmlFor="profileName">Full Name</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <input 
                      type="email" 
                      className="form-control rounded-3" 
                      id="profileEmail" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label htmlFor="profileEmail">Email Address</label>
                  </div>
                </div>
              </div>

              {/* Avatar Selection Grid */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark small mb-2 d-block">
                  <i className="bi bi-grid-fill me-1"></i> Choose Character Avatar
                </label>
                <div className="d-flex flex-wrap gap-2.5 p-3 rounded-4 bg-light border border-light">
                  {avatarList.map((av) => (
                    <button
                      key={av}
                      type="button"
                      className={`btn p-0 d-flex align-items-center justify-content-center rounded-circle border border-2 transition-all ${
                        selectedAvatar === av ? "border-purple bg-white scale-up" : "border-transparent bg-transparent opacity-60"
                      }`}
                      style={{ 
                        width: "50px", 
                        height: "50px", 
                        fontSize: "2rem",
                        borderColor: selectedAvatar === av ? "#8a2be2" : "transparent",
                        boxShadow: selectedAvatar === av ? "0 4px 12px rgba(138,43,226,0.2)" : "none"
                      }}
                      onClick={() => setSelectedAvatar(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-secondary border-opacity-25 my-4" />

              {/* Password update */}
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-shield-lock text-purple" style={{ color: "#8a2be2" }}></i> Change Password
              </h5>
              
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input 
                      type="password" 
                      className="form-control rounded-3" 
                      id="profilePassword" 
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="profilePassword">New Password (leave blank to keep)</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <input 
                      type="password" 
                      className="form-control rounded-3" 
                      id="profileConfirmPassword" 
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <label htmlFor="profileConfirmPassword">Confirm New Password</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-premium px-5 py-2.5 shadow rounded-pill" disabled={saving}>
                {saving ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .scale-up {
          transform: scale(1.15);
        }
        .btn:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default Profile;