import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Sweets from "@/pages/Sweets";
import Admin from "@/pages/Admin";
import Purchase from "@/pages/Purchase";
import Body from "@/components/Body";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { API_BASE_URL, IS_PROD } from "./utils/constant";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{ background: "linear-gradient(135deg, #ff9a9e, #fad0c4)" }}
        className="min-h-screen flex items-center justify-center"
      >
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{ background: "linear-gradient(135deg, #ff9a9e, #fad0c4)" }}
        className="min-h-screen flex items-center justify-center"
      >
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    const isProd = IS_PROD;
    const isRender =
      typeof API_BASE_URL === "string" && API_BASE_URL.includes("render.com");
    const key = "render_free_tier_toast_shown_v1";
    const shown = sessionStorage.getItem(key) === "1";
    if (isProd && isRender && !shown) {
      toast(
        "Backend is on Render free tier. First request may take up to 30–60s. Please wait…",
        {
          icon: "ℹ️",
          style: {
            background: "#E0F2FE",
            color: "#0369A1",
            border: "1px solid #7DD3FC",
          },
          duration: 6000,
        }
      );
      sessionStorage.setItem(key, "1");
    }
  }, []);
  return (
    <Router>
      <Toaster position="top-right" />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Body />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Sweets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase/:id"
              element={
                <ProtectedRoute>
                  <Purchase />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
