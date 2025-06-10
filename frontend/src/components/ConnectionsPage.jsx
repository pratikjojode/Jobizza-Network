import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ConnectionsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="connections-page-container">
      <h1 className="connections-page-heading">My Connections Network</h1>
      {user && (
        <p className="dashboard-welcome-text">
          Welcome, {user.fullName} ({user.role})!
        </p>
      )}
      <p className="dashboard-message">
        This is where your professional network content will be displayed.
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

export default ConnectionsPage;
