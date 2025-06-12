import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUsers,
  FaBell,
  FaCalendarPlus,
  FaEdit,
  FaBlog,
  FaCog,
  FaBars,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

import "../styles/UniqueConnectionsHeader.css";

function ConnectionsHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(
        `/search?q=${encodeURIComponent(
          searchTerm.trim()
        )}&filter=${searchFilter}`
      );
      setSearchTerm("");
      setIsMenuOpen(false);
    }
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
          <form
            onSubmit={handleSearch}
            className="header-search-form mobile-search"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search connections"
            />
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="search-filter-select"
              aria-label="Select search filter"
            >
              <option value="all">All</option>
              <option value="people">People</option>
              <option value="companies">Companies</option>
              <option value="posts">Posts</option>
            </select>
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>

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
        <form
          onSubmit={handleSearch}
          className="header-search-form desktop-search"
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search connections"
          />
          <select
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="search-filter-select"
            aria-label="Select search filter"
          >
            <option value="all">All</option>
            <option value="people">People</option>
            <option value="companies">Companies</option>
            <option value="posts">Posts</option>
          </select>
          <button type="submit" className="search-button">
            <FaSearch />
          </button>
        </form>

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
