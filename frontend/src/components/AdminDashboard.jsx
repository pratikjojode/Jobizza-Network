import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-dashboard-heading">Admin Dashboard</h1>
      {user && (
        <p className="dashboard-welcome-text">
          Welcome, {user.fullName} ({user.role})!
        </p>
      )}
      <p className="dashboard-message">
        This is where admin-specific content will go.
      </p>
      <button className="logout-button" onClick={logout}>
        Logout
      </button>
      <Link to="/" className="dashboard-home-link">
        Go to Home
      </Link>
    </div>
  );
}

export default AdminDashboard;
