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
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const isLinkActive = (path) => {
    if (path === "") {
      return location.pathname === "/admin/dashboard";
    }
    return location.pathname.includes(`/admin/dashboard/${path}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isSidebarOpen, isDropdownOpen]);

  return (
    <div className="admin-dashboard-layout">
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
          <Link to="/admin/dashboard" className="header-icon-btn">
            <FaChartLine />
          </Link>
          <button className="header-icon-btn">
            <FaCog />
          </button>
          <div
            className="user-dropdown"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaUser className="user-avatar-icon" />
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
                <FaSignOutAlt className="dropdown-icon" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`admin-main-container ${
          !isSidebarOpen ? "sidebar-collapsed" : ""
        }`}
      >
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
                  to="/admin/dashboard"
                  className={`sidebar-link ${
                    isLinkActive("") ? "isActive" : ""
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <FaChartLine className="sidebar-icon" />
                  <span className="sidebar-text">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="profile"
                  className={`sidebar-link ${
                    isLinkActive("profile") ? "isActive" : ""
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
                    isLinkActive("users") ? "isActive" : ""
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
                    isLinkActive("blogs") ? "isActive" : ""
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
                    isLinkActive("connections") ? "isActive" : ""
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <FaLink className="sidebar-icon" />
                  <span className="sidebar-text">Manage Connections</span>
                </Link>
              </li>

              <li>
                <Link
                  to="events"
                  className={`sidebar-link ${
                    isLinkActive("events") ? "isActive" : ""
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <FaCalendarAlt className="sidebar-icon" />
                  <span className="sidebar-text">Events</span>
                </Link>
              </li>

              <li>
                <Link
                  to="support"
                  className={`sidebar-link ${
                    isLinkActive("support") ? "isActive" : ""
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
