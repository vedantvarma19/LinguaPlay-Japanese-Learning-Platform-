import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  // ✅ READ ROLE FROM LOCAL STORAGE
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        backgroundColor: "#1cbf73",
        color: "white"
      }}
    >
      {/* LEFT */}
      <h2 style={{ margin: 0 }}>LinguaPlay</h2>

      {/* RIGHT */}
      <div>
        <Link to="/flashcards/N5" style={linkStyle}>
          Flashcards
        </Link>

        <Link to="/quiz/N5" style={linkStyle}>
          Quiz
        </Link>

        {/* ✅ ADMIN ONLY */}
        {role === "admin" && (
          <Link to="/admin" style={linkStyle}>
            Admin
          </Link>
        )}

        <button onClick={logout} style={logoutStyle}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const linkStyle = {
  color: "white",
  marginRight: "20px",
  textDecoration: "none",
  fontWeight: "bold"
};

const logoutStyle = {
  backgroundColor: "white",
  color: "#1cbf73",
  border: "none",
  padding: "6px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};

export default Navbar;
