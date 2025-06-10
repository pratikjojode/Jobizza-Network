import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./components/HomePage";
import AuthForm from "./components/AuthForm";
import AdminDashboard from "./components/AdminDashboard"; // Your AdminDashboard layout component
import ConnectionsPage from "./components/ConnectionsPage";
import NotFound from "./components/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ForgotPasswordForm from "./pages/ForgotPasswordForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";

// IMPORTANT: Ensure these imports and their paths are correct
import AdminProfile from "./Admin/AdminProfile";
import ManageUsers from "./Admin/ManageUsers";
import ManageBlogs from "./Admin/ManageBlogs";
import ManageConnections from "./Admin/ManageConnection"; // Adjust if your file is named ManageConnections.js

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthForm isRegister={false} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <AuthForm isRegister={true} />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <PublicRoute>
                <VerifyOtpPage />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordForm />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPasswordForm />
              </PublicRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["Admin"]}>
                <AdminDashboard />{" "}
                {/* This component provides the layout and the <Outlet /> */}
              </PrivateRoute>
            }
          >
            <Route
              index
              element={
                <div>
                  <h2>Welcome to the Admin Panel!</h2>
                  <p>
                    Please select an option from the sidebar to manage your
                    application.
                  </p>
                </div>
              }
            />
            <Route path="profile" element={<AdminProfile />} />{" "}
            <Route path="users" element={<ManageUsers />} />{" "}
            <Route path="blogs" element={<ManageBlogs />} />{" "}
            <Route path="connections" element={<ManageConnections />} />{" "}
          </Route>

          <Route
            path="/connections"
            element={
              <PrivateRoute allowedRoles={["CEO", "CFO", "CTO", "CHRO", "CXO"]}>
                <ConnectionsPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
