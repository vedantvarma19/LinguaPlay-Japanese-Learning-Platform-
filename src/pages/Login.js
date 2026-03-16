import {useState, useEffect, useRef} from "react";
import API from "../services/api";
import {useNavigate} from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
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

        const chars = ["あ", "い", "う", "え", "お", "ア", "イ", "ウ", "エ", "オ"];

        const createChar = () => ({
            char: chars[Math.floor(Math.random() * chars.length)],
            x: Math.random() * (canvas.width / dpr - 120) + 60,
            y: Math.random() * -300,
            size: 60,
            speed: 2 + Math.random() * 1.2
        });

        let drops = [createChar(), createChar(), createChar()];

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drops.forEach((d) => {
                ctx.font = `${d.size}px "Segoe UI", sans-serif`;
                ctx.fillStyle = "#ffffff";
                ctx.shadowBlur = 12;
                ctx.shadowColor = "#ffffff";
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
    };
    /* 🔐 LOGIN / SIGNUP (FIXED) */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const res = await API.post("/auth/login", {email, password});
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role);
                navigate("/");
            } else {
                await API.post("/auth/register", {name, email, password});
                setIsLogin(true);
                // Use a separate state for success messages or a clearer key
                setSuccess("Account created! Please login 😊");
            }
        } catch (err) {
            // Provide a more accurate fallback depending on the mode
            const defaultError = isLogin
                ? "Invalid email or password."
                : "Registration failed. Please try again.";

            setError(err?.response?.data?.message || defaultError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* LEFT PANEL */}
            <div className="auth-left">
                <canvas ref={canvasRef} className="rain-canvas"/>
                <div className="auth-left-content">
                    <h1>Welcome to LinguaPlay 🌸</h1>
                    <p>Learn languages smarter with fun & interaction.</p>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="auth-right">
                <div className="auth-card">
                    {/* Toggle */}
                    <div className="auth-toggle">
  <span
      className={isLogin ? "active" : ""}
      onClick={() => toggleMode(true)}
  >
    Login
  </span>
                        <span
                            className={!isLogin ? "active" : ""}
                            onClick={() => toggleMode(false)}
                        >
    Sign Up
  </span>
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {isLogin ? "Login" : "Create Account"}
                        </button>
                    </form>

                    {/* OR */}
                    <div className="divider">
                        <span>or</span>
                    </div>

                    {/* SOCIAL LOGIN (UI ONLY) */}
                    <button className="social-login google">
                        <span className="icon">G</span>
                        Sign in with Google
                    </button>

                    <button className="social-login facebook">
                        <span className="icon">f</span>
                        Sign in with Facebook
                    </button>

                    <button className="social-login apple">
                        <span className="icon"></span>
                        Sign in with Apple
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
