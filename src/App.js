import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";

// Pages
import Login from "./pages/Login";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import AdminDashboard from "./pages/AdminDashboard";

/* 🔒 Auth-only Route */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

/* 🧠 Layout Controller */
const Layout = () => {
  const location = useLocation();

  // ⛔ Hide navbar on login page
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />

        {/* DEFAULT → N5 FLASHCARDS */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/flashcards/N5" replace />
            </ProtectedRoute>
          }
        />

        {/* FLASHCARDS (LEVEL-WISE) */}
        <Route
          path="/flashcards/:level"
          element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          }
        />

        {/* QUIZ (LEVEL-WISE) */}
        <Route
          path="/quiz/:level"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />

        {/* 🔐 ADMIN (ROLE-PROTECTED) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
