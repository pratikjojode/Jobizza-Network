import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./components/HomePage";

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

import { ToastContainer, Bounce } from "react-toastify"; // Import Bounce transition
import "react-toastify/dist/ReactToastify.css";

import AdminProfile from "./Admin/AdminProfile";
import ManageUsers from "./Admin/ManageUsers";
import ManageBlogs from "./Admin/ManageBlogs";
import ManageConnections from "./Admin/ManageConnection";
import MyProfile from "./pages/MyProfile";
import ManageRequestsPage from "./pages/ManageRequestsPage";
import CreateBlogPost from "./pages/CreateBlogPost";
import BlogsOverview from "./pages/BlogsOverview";
import BlogDetail from "./pages/BlogDetail";
import CreateNetwork from "./pages/CreateNetwork";

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
          <Route path="/blogs/:blogId" element={<BlogDetail />} />
          <Route path="/network/createNetwork" element={<CreateNetwork />} />
          <Route path="/my-connections" element={<ManageRequestsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/blogs/create" element={<CreateBlogPost />} />
          <Route path="/blogs/manageBlogs" element={<BlogsOverview />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
          limit={3}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
