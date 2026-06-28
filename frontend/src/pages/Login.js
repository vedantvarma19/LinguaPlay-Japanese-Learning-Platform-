import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP flow states
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  // Google flow states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  const navigate = useNavigate();
  const canvasRef = useRef(null);

  /* 🌸 BACKGROUND ANIMATION */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = ["あ", "い", "う", "え", "お", "ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ"];

    const createChar = () => ({
      char: chars[Math.floor(Math.random() * chars.length)],
      x: Math.random() * (canvas.width / dpr - 80) + 40,
      y: Math.random() * -300,
      size: 40 + Math.random() * 20,
      speed: 1.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.4
    });

    let drops = Array.from({ length: 8 }, () => createChar());

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach((d) => {
        ctx.font = `bold ${d.size}px "Outfit", sans-serif`;
        ctx.fillStyle = `rgba(225, 0, 255, ${d.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#e100ff";
        ctx.fillText(d.char, d.x, d.y);

        d.y += d.speed;
        if (d.y > canvas.height / dpr + 60) {
          Object.assign(d, createChar());
        }
      });

      requestAnimationFrame(draw);
    };

    draw();
    return () => window.removeEventListener("resize", resize);
  }, []);

  const toggleMode = (mode) => {
    setIsLogin(mode);
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setShowOtpScreen(false);
    setEnteredOtp("");
  };

  /* 🔐 AUTH SUBMIT LOGIC */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Direct Login
        const res = await API.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("userName", res.data.user?.name || "Learner");
        localStorage.setItem("userAvatar", res.data.user?.avatar || "🦊");
        localStorage.setItem("userStreak", res.data.user?.streak || 1);
        navigate("/");
      } else {
        // Registration -> Request OTP
        const res = await API.post("/auth/send-otp", { email });
        setOtpCode(res.data.otp);
        setShowOtpScreen(true);
        setOtpMessage("A verification code was sent to your email!");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  /* 🔍 VERIFY OTP LOGIC */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        name,
        email,
        password,
        otp: enteredOtp
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userName", res.data.user?.name || "Learner");
      localStorage.setItem("userAvatar", res.data.user?.avatar || "🦊");
      localStorage.setItem("userStreak", res.data.user?.streak || 1);
      
      // Dispatch update event
      window.dispatchEvent(new Event("updateUserStats"));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  /* 🌐 ACTUAL GOOGLE LOGIN LOGIC */
  const handleActualGoogleLogin = async (credentialToken) => {
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/google-login", {
        credential: credentialToken
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userName", res.data.user?.name || "Learner");
      localStorage.setItem("userAvatar", res.data.user?.avatar || "🦊");
      localStorage.setItem("userStreak", res.data.user?.streak || 1);

      // Dispatch update event
      window.dispatchEvent(new Event("updateUserStats"));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  /* 🌐 MOCK GOOGLE LOGIN LOGIC */
  const handleMockGoogleLogin = async (mockName, mockEmail, mockAvatar) => {
    setError("");
    setShowGoogleModal(false);
    setLoading(true);

    try {
      const res = await API.post("/auth/google-login", {
        name: mockName,
        email: mockEmail,
        avatar: mockAvatar
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userName", res.data.user?.name || mockName);
      localStorage.setItem("userAvatar", res.data.user?.avatar || mockAvatar);
      localStorage.setItem("userStreak", res.data.user?.streak || 1);

      // Dispatch update event
      window.dispatchEvent(new Event("updateUserStats"));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customGoogleName || !customGoogleEmail) return;
    handleMockGoogleLogin(customGoogleName, customGoogleEmail, "🐯");
  };

  return (
    <div className="auth-container d-flex flex-column flex-md-row min-vh-100">
      {/* LEFT PANEL */}
      <div 
        className="auth-left flex-grow-1 position-relative p-5 d-flex align-items-center justify-content-center"
        style={{
          background: "linear-gradient(135deg, #1c0a35 0%, #06020c 100%)",
          borderRight: "1px solid rgba(138, 43, 226, 0.25)"
        }}
      >
        <canvas ref={canvasRef} className="rain-canvas" />
        <div className="auth-left-content text-center text-md-start position-relative" style={{ zIndex: 10 }}>
          <h1 className="fw-extrabold display-3 text-white">
            LinguaPlay <span style={{ textShadow: "0 0 15px #e100ff" }}>🌸</span>
          </h1>
          <p className="lead text-white-50 fs-4">
            Level up your Japanese vocabulary with modern visual flashcards and interactive quizzes.
          </p>
          <div className="mt-4 d-none d-md-flex align-items-center gap-3">
            <span className="badge rounded-pill px-3 py-2 bg-gradient bg-purple" style={{ backgroundColor: "#8a2be2" }}>
              🏆 Global Leaderboard
            </span>
            <span className="badge rounded-pill px-3 py-2 bg-gradient bg-success" style={{ backgroundColor: "#1cbf73" }}>
              ⚡ Real-time XP
            </span>
            <span className="badge rounded-pill px-3 py-2 bg-gradient bg-warning text-dark" style={{ backgroundColor: "#ffb900" }}>
              🔥 Active Streaks
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right d-flex align-items-center justify-content-center p-5 bg-light flex-shrink-0" style={{ width: "100%", maxWidth: "550px" }}>
        <div className="auth-card p-4 rounded-4 shadow-lg bg-white w-100" style={{ maxWidth: "420px", border: "1px solid rgba(138, 43, 226, 0.15)" }}>
          {/* Toggle Tab Header */}
          {!showOtpScreen && (
            <div className="d-flex justify-content-center gap-4 mb-4 pb-2 border-bottom">
              <span
                className={`fs-5 fw-bold cursor-pointer transition-all pb-2 ${isLogin ? "text-purple border-bottom border-3 border-purple" : "text-muted"}`}
                style={{ cursor: "pointer", color: isLogin ? "#8a2be2" : "" }}
                onClick={() => toggleMode(true)}
              >
                Login
              </span>
              <span
                className={`fs-5 fw-bold cursor-pointer transition-all pb-2 ${!isLogin ? "text-purple border-bottom border-3 border-purple" : "text-muted"}`}
                style={{ cursor: "pointer", color: !isLogin ? "#8a2be2" : "" }}
                onClick={() => toggleMode(false)}
              >
                Sign Up
              </span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger py-2.5 px-3 rounded-3 small animate fade-in-up" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* OTP FORM SCREEN */}
          {showOtpScreen ? (
            <form onSubmit={handleVerifyOtp} className="animate fade-in-up">
              <h3 className="fw-bold mb-2">Verify Account</h3>
              <p className="text-muted small mb-3">We have sent a verification code to <strong>{email}</strong>.</p>
              
              {otpMessage && (
                <div className="alert alert-success py-2.5 px-3 rounded-3 small mb-3">
                  <i className="bi bi-send-fill me-2"></i> {otpMessage}
                </div>
              )}

              {/* SIMULATOR OTP BADGE */}
              <div 
                className="p-3 mb-4 rounded-3 text-center border font-monospace"
                style={{
                  background: "rgba(138, 43, 226, 0.05)",
                  borderColor: "rgba(138, 43, 226, 0.25)"
                }}
              >
                <div className="small text-muted mb-1 font-sans">🤖 [SIMULATOR CODE]</div>
                <div className="fs-3 fw-bold text-gradient" style={{ letterSpacing: "5px" }}>{otpCode}</div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-link text-decoration-none mt-1 p-0 text-purple"
                  onClick={() => setEnteredOtp(otpCode)}
                >
                  <i className="bi bi-pencil-fill me-1"></i> Auto-fill OTP Code
                </button>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  maxLength="6"
                  className="form-control rounded-3"
                  id="otpInput"
                  placeholder="123456"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  required
                />
                <label htmlFor="otpInput">Enter 6-Digit OTP</label>
              </div>

              <button type="submit" className="btn btn-premium w-100 py-2.5" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Verify & Register
              </button>

              <button 
                type="button" 
                className="btn btn-outline-secondary w-100 py-2.5 mt-2 rounded-pill"
                onClick={() => setShowOtpScreen(false)}
              >
                Back to Registration
              </button>
            </form>
          ) : (
            /* STANDARD LOGIN / SIGNUP FORM */
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    id="nameInput"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <label htmlFor="nameInput">Full Name</label>
                </div>
              )}

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control rounded-3"
                  id="emailInput"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="emailInput">Email Address</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-3"
                  id="passwordInput"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="passwordInput">Password</label>
              </div>

              <button type="submit" className="btn btn-premium w-100 py-2.5 rounded-pill shadow-sm" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                {isLogin ? "Log In" : "Create Account"}
              </button>
            </form>
          )}

          {/* Social login divider */}
          {!showOtpScreen && (
            <>
              <div className="d-flex align-items-center my-4 text-muted small">
                <hr className="flex-grow-1" />
                <span className="px-3">or continue with</span>
                <hr className="flex-grow-1" />
              </div>

              <div className="d-flex flex-column align-items-center gap-2 w-100">
                <div className="w-100 d-flex justify-content-center">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      handleActualGoogleLogin(credentialResponse.credential);
                    }}
                    onError={() => {
                      setError("Google authentication failed. Please try again.");
                    }}
                    theme="outline"
                    shape="pill"
                    width="280"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setShowGoogleModal(true)} 
                  className="btn btn-link text-decoration-none text-muted small mt-2"
                  style={{ fontSize: "0.8rem" }}
                >
                  Or use mock accounts (offline demo)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 🌟 MOCK GOOGLE LOGIN MODAL OVERLAY */}
      {showGoogleModal && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)" 
          }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "400px" }}>
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden animate fade-in-up">
              {/* Google Modal Header */}
              <div className="modal-header border-0 pb-0 text-center d-flex flex-column align-items-center pt-4">
                <span className="fs-1 text-danger d-inline-block mb-2">
                  <i className="bi bi-google"></i>
                </span>
                <h5 className="modal-title fw-bold">Sign in with Google</h5>
                <p className="text-muted small">to continue to <strong>LinguaPlay</strong></p>
              </div>

              {/* Google Accounts List */}
              <div className="modal-body px-4 pb-4">
                <div className="list-group gap-2 mb-4">
                  {/* Account 1 */}
                  <button 
                    type="button" 
                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 border rounded-3 p-2.5"
                    onClick={() => handleMockGoogleLogin("Taro Yamada", "taro.yamada@gmail.com", "🦊")}
                  >
                    <span className="fs-3">🦊</span>
                    <div className="text-start" style={{ lineHeight: "1.2" }}>
                      <div className="fw-bold small text-dark">Taro Yamada</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>taro.yamada@gmail.com</div>
                    </div>
                  </button>

                  {/* Account 2 */}
                  <button 
                    type="button" 
                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 border rounded-3 p-2.5"
                    onClick={() => handleMockGoogleLogin("Hanako Sato", "hanako.sato@gmail.com", "🐱")}
                  >
                    <span className="fs-3">🐱</span>
                    <div className="text-start" style={{ lineHeight: "1.2" }}>
                      <div className="fw-bold small text-dark">Hanako Sato</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>hanako.sato@gmail.com</div>
                    </div>
                  </button>

                  {/* Account 3 */}
                  <button 
                    type="button" 
                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 border rounded-3 p-2.5"
                    onClick={() => handleMockGoogleLogin("Kenji Takahashi", "kenji.t@gmail.com", "🍣")}
                  >
                    <span className="fs-3">🍣</span>
                    <div className="text-start" style={{ lineHeight: "1.2" }}>
                      <div className="fw-bold small text-dark">Kenji Takahashi</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>kenji.t@gmail.com</div>
                    </div>
                  </button>
                </div>

                {/* Custom Google Account Option */}
                <div className="border-top pt-3">
                  <div className="small text-muted mb-2 text-center fw-semibold">Use Another Google Account</div>
                  <form onSubmit={handleCustomGoogleSubmit}>
                    <input 
                      type="text" 
                      placeholder="Name" 
                      className="form-control form-control-sm mb-2 rounded-2"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      required
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="form-control form-control-sm mb-2 rounded-2"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-sm btn-dark w-100 rounded-2">
                      Sign In
                    </button>
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 bg-light py-2 d-flex justify-content-center">
                <button 
                  type="button" 
                  className="btn btn-sm btn-link text-decoration-none text-muted"
                  onClick={() => setShowGoogleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
