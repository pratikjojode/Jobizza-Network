import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./components/HomePage";
import AboutUs from "./components/AboutUs";
import AuthForm from "./components/AuthForm";
import AdminDashboard from "./components/AdminDashboard";
import ConnectionsPage from "./components/ConnectionsPage";
import NotFound from "./components/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ForgotPasswordForm from "./pages/ForgotPasswordForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import UserProfilePage from "./pages/UserProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage";

// Import ToastContainer and its CSS
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminProfile from "./Admin/AdminProfile";
import ManageUsers from "./Admin/ManageUsers";
import ManageBlogs from "./Admin/ManageBlogs";
import ManageConnections from "./Admin/ManageConnection";
import MyProfile from "./pages/MyProfile";
import ManageRequestsPage from "./pages/ManageRequestsPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
           <Route path="/about" element={<AboutUs />} />
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
                <AdminDashboard />
              </PrivateRoute>
            }
          >
            <Route
              index
              element={
                <>
                  <h2>Welcome to the Admin Panel!</h2>
                  <p>
                    Please select an option from the sidebar to manage your
                    application.
                  </p>
                </>
              }
            />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="blogs" element={<ManageBlogs />} />
            <Route path="connections" element={<ManageConnections />} />
          </Route>

          <Route
            path="/connections"
            element={
              <PrivateRoute allowedRoles={["CEO", "CFO", "CTO", "CHRO", "CXO"]}>
                <ConnectionsPage />
              </PrivateRoute>
            }
          />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/my-connections" element={<ManageRequestsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Place ToastContainer inside Router, typically after Routes or AuthProvider */}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
