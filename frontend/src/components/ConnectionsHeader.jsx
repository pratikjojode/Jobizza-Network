import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUsers,
  FaBell,
  FaCalendarPlus,
  FaEdit,
  FaBlog,
  FaCog,
  FaBars,
  FaTimes, // Import FaTimes for the close icon
} from "react-icons/fa";

import "../styles/UniqueConnectionsHeader.css";

function ConnectionsHeader() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="connect-page-main-header">
      <div className="header-left-content-area">
        <Link to="/" className="app-brand-logo-link">
          Jobizaa Network
        </Link>
        <div className="hamburger-menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
        <nav
          className={`header-navigation-menu ${isMenuOpen ? "menu-open" : ""}`}
        >
          <Link
            to="/connections"
            className="nav-item-icon-link"
            title="My Connections"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaUsers />
            <span className="nav-item-text">Connections</span>
          </Link>
          <Link
            to="/notifications"
            className="nav-item-icon-link"
            title="Notifications"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaBell />
            <span className="nav-item-text">Notifications</span>
          </Link>
          <Link
            to="/events/create"
            className="nav-item-icon-link"
            title="Create Event"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaCalendarPlus />
            <span className="nav-item-text">Create Event</span>
          </Link>
          <Link
            to="/posts/create"
            className="nav-item-icon-link"
            title="Create Post"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaEdit />
            <span className="nav-item-text">Create Post</span>
          </Link>
          <Link
            to="/blogs/create"
            className="nav-item-icon-link"
            title="Create Blog"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaBlog />
            <span className="nav-item-text">Create Blog</span>
          </Link>
        </nav>
      </div>

      <div className="header-right-user-actions">
        {user && (
          <Link to="/profile" className="user-profile-display-link">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="user-profile-avatar-img"
              />
            ) : (
              <div className="user-profile-avatar-placeholder-div">
                {user.fullName?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <span className="user-profile-name-text">My Profile</span>
          </Link>
        )}
        <Link to="/settings" className="settings-icon-link" title="Settings">
          <FaCog />
        </Link>
        <button onClick={logout} className="logout-action-button">
          Logout
        </button>
      </div>
    </header>
  );
}

export default ConnectionsHeader;
