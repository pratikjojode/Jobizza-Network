import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Changed Link to NavLink
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

import "../styles/ConnectionsHeader.css";

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
      setIsMenuOpen(false); // Close menu after search on mobile
    }
  };

  return (
    <header className="connect-page-main-header">
      <div className="header-left-content-area">
        <NavLink
          to="/"
          className="app-brand-logo-link"
          onClick={() => setIsMenuOpen(false)}
        >
          Jobizaa Network
        </NavLink>
        {/* Desktop Navigation Links - hidden on mobile, shown on desktop */}
        <nav className="header-navigation-menu desktop-nav-links">
          <NavLink
            to="/connections"
            className={({ isActive }) =>
              isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
            }
            title="My Connections"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaUsers />
            <span className="nav-item-text">Connections</span>
          </NavLink>
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
            }
            title="Notifications"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaBell />
            <span className="nav-item-text">Notifications</span>
          </NavLink>
          <NavLink
            to="/events/create"
            className={({ isActive }) =>
              isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
            }
            title="Create Event"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaCalendarPlus />
            <span className="nav-item-text">Create Event</span>
          </NavLink>
          <NavLink
            to="/posts/create"
            className={({ isActive }) =>
              isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
            }
            title="Create Post"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaEdit />
            <span className="nav-item-text">Create Post</span>
          </NavLink>
          <NavLink
            to="/blogs/create"
            className={({ isActive }) =>
              isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
            }
            title="Create Blog"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaBlog />
            <span className="nav-item-text">Create Blog</span>
          </NavLink>
          <NavLink
            to="/blogs/manageBlogs"
            className={({ isActive }) =>
              isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
            }
            title="View Blog"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaBlog />
            <span className="nav-item-text">View Blog</span>
          </NavLink>
          <NavLink
            to="/network/createNetwork"
            className={({ isActive }) =>
              isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
            }
            title="Create Network"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaUsers />
            <span className="nav-item-text">Network</span>
          </NavLink>
          <NavLink
            to="/events/viewAllEvents"
            className={({ isActive }) =>
              isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
            }
            title="View Events"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaBlog />
            <span className="nav-item-text">View Events</span>
          </NavLink>
        </nav>
      </div>

      <div className="header-right-user-actions">
        {/* Desktop Search Form - visible only on desktop */}
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
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "user-profile-display-link desktop-only active"
                : "user-profile-display-link desktop-only"
            }
            onClick={() => setIsMenuOpen(false)}
          >
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
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "settings-icon-link desktop-only active"
              : "settings-icon-link desktop-only"
          }
          title="Settings"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaCog />
        </NavLink>
        <button onClick={logout} className="logout-action-button desktop-only">
          Logout
        </button>

        {/* Hamburger Menu Icon (Mobile Only) */}
        <div className="hamburger-menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* Mobile Navigation Menu (Side Drawer) - This is a separate element for mobile */}
      <nav
        className={`header-navigation-menu mobile-menu-drawer ${isMenuOpen ? "menu-open" : ""}`}
      >
        {/* Mobile Search Form - visible only when menu is open on mobile */}
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

        {/* Navigation Links for Mobile Menu */}
        <NavLink
          to="/connections"
          className={({ isActive }) =>
            isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
          }
          title="My Connections"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaUsers />
          <span className="nav-item-text">Connections</span>
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
          }
          title="Notifications"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaBell />
          <span className="nav-item-text">Notifications</span>
        </NavLink>
        <NavLink
          to="/events/create"
          className={({ isActive }) =>
            isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
          }
          title="Create Event"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaCalendarPlus />
          <span className="nav-item-text">Create Event</span>
        </NavLink>
        <NavLink
          to="/posts/create"
          className={({ isActive }) =>
            isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
          }
          title="Create Post"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaEdit />
          <span className="nav-item-text">Create Post</span>
        </NavLink>
        <NavLink
          to="/blogs/create"
          className={({ isActive }) =>
            isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
          }
          title="Create Blog"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaBlog />
          <span className="nav-item-text">Create Blog</span>
        </NavLink>
        <NavLink
          to="/blogs/manageBlogs"
          className={({ isActive }) =>
            isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
          }
          title="View Blog"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaBlog />
          <span className="nav-item-text">View Blog</span>
        </NavLink>
        <NavLink
          to="/network/createNetwork"
          className={({ isActive }) =>
            isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
          }
          title="Create Network"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaUsers />
          <span className="nav-item-text">Network</span>
        </NavLink>
        <NavLink
          to="/events/viewAllEvents"
          className={({ isActive }) =>
            isActive ? "nav-item-icon-link active" : "nav-item-icon-link"
          }
          title="View Events"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaBlog />
          <span className="nav-item-text">View Events</span>
        </NavLink>

        {/* Mobile User Actions - visible only when menu is open on mobile */}
        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "user-profile-display-link mobile-only active"
                : "user-profile-display-link mobile-only"
            }
            onClick={() => setIsMenuOpen(false)}
          >
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
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "settings-icon-link mobile-only active"
              : "settings-icon-link mobile-only"
          }
          title="Settings"
          onClick={() => setIsMenuOpen(false)}
        >
          <FaCog />
          <span className="nav-item-text">Settings</span>
        </NavLink>

        <button onClick={logout} className="logout-action-button mobile-only">
          Logout
        </button>
      </nav>
    </header>
  );
}

export default ConnectionsHeader;
