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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768;
      setIsMobile(currentIsMobile);
      if (!currentIsMobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleClickOutside);
    };
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
            <div className={`dropdown-content ${isDropdownOpen ? "show" : ""}`}>
              <Link
                to="profile"
                onClick={() => {
                  closeDropdown();
                  isMobile && toggleSidebar();
                }}
              >
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => {
                  closeDropdown();
                  isMobile && toggleSidebar();
                }}
              >
                Account Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  closeDropdown();
                }}
              >
                Logout
              </button>
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
          <div className="sidebar-content">
            <h2 className="sidebar-heading">
              <span className="sidebar-text">Admin Navigation</span>
            </h2>
            <ul className="sidebar-menu">
              <li>
                <Link
                  to="profile"
                  className={`sidebar-link ${
                    location.pathname.includes("/admin/profile")
                      ? "isActive"
                      : ""
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <FaUser className="sidebar-icon" />
                  <span className="sidebar-text">Admin Profile</span>
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
                  <FaUsers className="sidebar-icon" />
                  <span className="sidebar-text">Manage Users</span>
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
                  <FaFileAlt className="sidebar-icon" />
                  <span className="sidebar-text">Manage Blogs</span>
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
                  <FaLink className="sidebar-icon" />
                  <span className="sidebar-text">Manage Connections</span>
                </Link>
              </li>
              <li>
                <Link
                  to="reports"
                  className={`sidebar-link ${
                    location.pathname.includes("/admin/reports")
                      ? "isActive"
                      : ""
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <FaChartLine className="sidebar-icon" />
                  <span className="sidebar-text">Reports</span>
                </Link>
              </li>
              <li>
                <Link
                  to="events"
                  className={`sidebar-link ${
                    location.pathname.includes("/admin/events")
                      ? "isActive"
                      : ""
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <FaCalendarAlt className="sidebar-icon" />
                  <span className="sidebar-text">Events</span>
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
                  <FaCog className="sidebar-icon" />
                  <span className="sidebar-text">Admin Settings</span>
                </Link>
              </li>
              <li>
                <Link
                  to="support"
                  className={`sidebar-link ${
                    location.pathname.includes("/admin/support")
                      ? "isActive"
                      : ""
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <FaLifeRing className="sidebar-icon" />
                  <span className="sidebar-text">Support</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="sidebar-footer">
            <button className="logout-button" onClick={logout}>
              <FaSignOutAlt className="sidebar-icon" />
              <span className="sidebar-text">Logout</span>
            </button>
            <Link
              to="/"
              className="dashboard-home-link"
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <FaHome className="sidebar-icon" />
              <span className="sidebar-text">Go to Home</span>
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
