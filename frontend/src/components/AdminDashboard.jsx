import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-dashboard-layout">
      {/* Thin Header */}
      <header className="admin-header">
        <div className="header-left">
          <div className="header-logo">Admin Portal</div>
        </div>

        <div className="header-right">
          <button className="header-icon-btn">
            <i className="icon-bell"></i>
          </button>
          <button className="header-icon-btn">
            <i className="icon-cog"></i>
          </button>
          <div className="user-dropdown">
            <div className="user-avatar">
              <span>{user?.fullName?.charAt(0)}</span>
            </div>
            <div className="dropdown-content">
              <Link to="profile">My Profile</Link>
              <Link to="/settings">Account Settings</Link>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-main-container">
        <div className="admin-sidebar">
          <h2 className="sidebar-heading">Admin Navigation</h2>
          <ul className="sidebar-menu">
            <li>
              <Link to="profile" className="sidebar-link">
                <i className="icon-user"></i>
                Admin Profile
              </Link>
            </li>
            <li>
              <Link to="users" className="sidebar-link">
                <i className="icon-users"></i>
                Manage Users
              </Link>
            </li>
            <li>
              <Link to="blogs" className="sidebar-link">
                <i className="icon-file"></i>
                Manage Blogs
              </Link>
            </li>
            <li>
              <Link to="connections" className="sidebar-link">
                <i className="icon-link"></i>
                Manage Connections
              </Link>
            </li>
          </ul>
          <div className="sidebar-footer">
            <button className="logout-button" onClick={logout}>
              <i className="icon-logout"></i>
              Logout
            </button>
            <Link to="/" className="dashboard-home-link">
              <i className="icon-home"></i>
              Go to Home
            </Link>
          </div>
        </div>

        <div className="admin-content">
          <h1 className="admin-dashboard-heading">Admin Dashboard</h1>
          {user && (
            <p className="dashboard-welcome-text">
              Welcome, {user.fullName} ({user.role})!
            </p>
          )}

          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
