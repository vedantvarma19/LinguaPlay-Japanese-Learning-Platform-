import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // User details state
  const [userStats, setUserStats] = useState({
    name: "Learner",
    xp: 0,
    level: 1,
    streak: 0,
    avatar: "🦊"
  });

  // Fetch stats if token is available
  useEffect(() => {
    if (!token) return;

    const fetchUserStats = async () => {
      try {
        // Fetch progress details
        const progressRes = await API.get("/progress");
        
        // Also attempt to get user profile details if available
        let profileDetails = {};
        try {
          const profileRes = await API.get("/auth/profile");
          profileDetails = profileRes.data.user || {};
        } catch (e) {
          // If profile endpoint is not implemented yet in this milestone, ignore
        }

        setUserStats(prev => ({
          ...prev,
          xp: progressRes.data.xp || 0,
          level: progressRes.data.level || 1,
          name: profileDetails.name || localStorage.getItem("userName") || "Learner",
          streak: profileDetails.streak || localStorage.getItem("userStreak") || 1,
          avatar: profileDetails.avatar || localStorage.getItem("userAvatar") || "🦊"
        }));
      } catch (err) {
        console.error("Error fetching stats in Navbar:", err);
      }
    };

    fetchUserStats();

    // Set up a listener for profile/XP updates
    const handleStatsUpdate = () => {
      fetchUserStats();
    };
    window.addEventListener("updateUserStats", handleStatsUpdate);

    return () => {
      window.removeEventListener("updateUserStats", handleStatsUpdate);
    };
  }, [token, location.pathname]); // Re-fetch on token changes or navigation

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userStreak");
    localStorage.removeItem("userAvatar");
    setDropdownOpen(false);
    navigate("/login");
  };

  // Skip showing Navbar on login page
  if (location.pathname === "/login") return null;

  return (
    <nav 
      className="navbar navbar-expand-md navbar-dark sticky-top shadow-lg py-2"
      style={{
        background: "linear-gradient(135deg, #1c0a35 0%, #0e051c 100%)",
        borderBottom: "1.5px solid rgba(138, 43, 226, 0.35)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div className="container-fluid px-4">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center fw-bold fs-4 text-white">
          <span className="me-2" style={{ fontSize: "1.5rem" }}>🌸</span>
          <span className="text-gradient" style={{ background: "linear-gradient(45deg, #ffffff, #e100ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            LinguaPlay
          </span>
        </Link>

        {/* Hamburger Toggler */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Main Links */}
          <ul className="navbar-nav me-auto mb-2 mb-md-0 ms-md-3 gap-2">
            <li className="nav-item">
              <Link 
                to="/flashcards/N5" 
                className={`nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-semibold transition-all ${
                  location.pathname.startsWith("/flashcards") ? "active bg-white bg-opacity-10 text-white" : "text-white-50"
                }`}
              >
                <i className="bi bi-card-text"></i> Flashcards
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/quiz/N5" 
                className={`nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-semibold transition-all ${
                  location.pathname.startsWith("/quiz") ? "active bg-white bg-opacity-10 text-white" : "text-white-50"
                }`}
              >
                <i className="bi bi-question-circle"></i> Quiz
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/leaderboard" 
                className={`nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-semibold transition-all ${
                  location.pathname === "/leaderboard" ? "active bg-white bg-opacity-10 text-white" : "text-white-50"
                }`}
              >
                <i className="bi bi-trophy"></i> Leaderboard
              </Link>
            </li>
          </ul>

          {/* Right Side: Profile Pill & Quick Stats */}
          {token && (
            <div className="d-flex align-items-center gap-3 ms-auto mt-2 mt-md-0 position-relative">
              {/* Profile Pill */}
              <div 
                className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border lp-glass cursor-pointer text-white transition-all hover-glow"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(138, 43, 226, 0.4)",
                  cursor: "pointer"
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* Avatar Icon / Emoji */}
                <span className="fs-5">{userStats.avatar}</span>
                
                {/* Name / User Stats */}
                <div className="d-none d-lg-block text-start me-1" style={{ lineHeight: "1.2" }}>
                  <div className="fw-bold small">{userStats.name}</div>
                  <div className="text-white-50" style={{ fontSize: "0.7rem" }}>{userStats.xp} XP</div>
                </div>

                {/* Level Badge */}
                <span className="badge bg-purple bg-gradient rounded-pill px-2.5 py-1 text-white border border-white border-opacity-25" style={{ backgroundColor: "#8a2be2", fontSize: "0.75rem" }}>
                  Lv.{userStats.level}
                </span>

                {/* Streak Fire Indicator */}
                {userStats.streak > 0 && (
                  <span className="d-flex align-items-center gap-0.5 text-warning font-monospace fw-bold" style={{ fontSize: "0.85rem" }}>
                    🔥{userStats.streak}
                  </span>
                )}
                
                {/* Chevron icon */}
                <i className={`bi bi-chevron-${dropdownOpen ? "up" : "down"} ms-1 text-white-50`} style={{ fontSize: "0.75rem" }}></i>
              </div>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div 
                  className="dropdown-menu show dropdown-menu-end shadow-lg py-2 border animate fade-in-up"
                  style={{
                    position: "absolute",
                    top: "105%",
                    right: 0,
                    zIndex: 1050,
                    minWidth: "200px",
                    background: "#160b2b",
                    border: "1.5px solid rgba(138, 43, 226, 0.5)",
                    borderRadius: "12px",
                  }}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-bottom border-secondary border-opacity-25">
                    <span className="text-white-50 small">Signed in as</span>
                    <div className="fw-bold text-white text-truncate">{userStats.name}</div>
                  </div>

                  <Link 
                    to="/profile" 
                    className="dropdown-item py-2 px-3 text-white d-flex align-items-center gap-2 rounded-0 hover-bg-purple"
                    style={{ transition: "all 0.2s" }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-person text-purple"></i> My Profile
                  </Link>

                  <Link 
                    to="/leaderboard" 
                    className="dropdown-item py-2 px-3 text-white d-flex align-items-center gap-2 rounded-0 hover-bg-purple"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-trophy text-warning"></i> Leaderboard
                  </Link>

                  {role === "admin" && (
                    <Link 
                      to="/admin" 
                      className="dropdown-item py-2 px-3 text-white d-flex align-items-center gap-2 rounded-0 hover-bg-purple"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-shield-lock text-danger"></i> Admin Control
                    </Link>
                  )}

                  <div className="dropdown-divider border-secondary border-opacity-25"></div>

                  <button 
                    onClick={logout}
                    className="dropdown-item py-2 px-3 text-danger d-flex align-items-center gap-2 w-100 text-start bg-transparent border-0 hover-bg-red"
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Inline styles for custom hover/active dropdown states */}
      <style>{`
        .hover-glow:hover {
          box-shadow: 0 0 15px rgba(138, 43, 226, 0.4);
          background: rgba(255, 255, 255, 0.12) !important;
        }
        .hover-bg-purple:hover {
          background-color: rgba(138, 43, 226, 0.25) !important;
        }
        .hover-bg-red:hover {
          background-color: rgba(220, 53, 69, 0.15) !important;
        }
        .nav-link {
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          color: #e100ff !important;
          background-color: rgba(255, 255, 255, 0.05);
        }
        .nav-link.active:hover {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
