import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaUsers,
  FaFileAlt,
  FaLink,
  FaChartLine,
  FaCalendarAlt,
  FaCog,
  FaLifeRing,
  FaBell,
  FaEnvelope,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768;
      setIsMobile(currentIsMobile);
      if (!currentIsMobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  return (
    <div className="admin-dashboard-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            {isMobile ? (
              <FaBars />
            ) : isSidebarOpen ? (
              <FaChevronLeft />
            ) : (
              <FaChevronRight />
            )}
          </button>
          <div className="header-logo">Admin Portal</div>
        </div>

        <div className="header-right">
          <button className="header-icon-btn">
            <FaBell />
          </button>
          <button className="header-icon-btn">
            <FaEnvelope />
          </button>
          <button className="header-icon-btn">
            <FaChartLine />
          </button>
          <button className="header-icon-btn">
            <FaCog />
          </button>
          <div className="user-dropdown">
            <div className="user-avatar">
              <span>{user?.fullName?.charAt(0)}</span>
            </div>
            <div className="dropdown-content">
              <Link to="profile" onClick={isMobile ? toggleSidebar : undefined}>
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={isMobile ? toggleSidebar : undefined}
              >
                Account Settings
              </Link>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`admin-main-container ${
          !isSidebarOpen ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Sidebar */}
        <div
          className={`admin-sidebar ${!isSidebarOpen ? "collapsed" : ""} ${
            isMobile && isSidebarOpen ? "mobile-open" : ""
          }`}
        >
          <h2 className="sidebar-heading">Admin Navigation</h2>
          <ul className="sidebar-menu">
            <li>
              <Link
                to="profile"
                className={`sidebar-link ${
                  location.pathname.includes("/admin/profile") ? "isActive" : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FaUser />
                <span>Admin Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="users"
                className={`sidebar-link ${
                  location.pathname.includes("/admin/users") ? "isActive" : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FaUsers />
                <span>Manage Users</span>
              </Link>
            </li>
            <li>
              <Link
                to="blogs"
                className={`sidebar-link ${
                  location.pathname.includes("/admin/blogs") ? "isActive" : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FaFileAlt />
                <span>Manage Blogs</span>
              </Link>
            </li>
            <li>
              <Link
                to="connections"
                className={`sidebar-link ${
                  location.pathname.includes("/admin/connections")
                    ? "isActive"
                    : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FaLink />
                <span>Manage Connections</span>
              </Link>
            </li>
            <li>
              <Link
                to="reports"
                className={`sidebar-link ${
                  location.pathname.includes("/admin/reports") ? "isActive" : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FaChartLine />
                <span>Reports</span>
              </Link>
            </li>
            <li>
              <Link
                to="events"
                className={`sidebar-link ${
                  location.pathname.includes("/admin/events") ? "isActive" : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FaCalendarAlt />
                <span>Events</span>
              </Link>
            </li>
            <li>
              <Link
                to="settings"
                className={`sidebar-link ${
                  location.pathname.includes("/admin/settings")
                    ? "isActive"
                    : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FaCog />
                <span>Admin Settings</span>
              </Link>
            </li>
            <li>
              <Link
                to="support"
                className={`sidebar-link ${
                  location.pathname.includes("/admin/support") ? "isActive" : ""
                }`}
                onClick={isMobile ? toggleSidebar : undefined}
              >
                <FaLifeRing />
                <span>Support</span>
              </Link>
            </li>
          </ul>

          <div className="sidebar-footer">
            <button className="logout-button" onClick={logout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
            <Link
              to="/"
              className="dashboard-home-link"
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <FaHome />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </div>
  );
}

export default AdminDashboard;
