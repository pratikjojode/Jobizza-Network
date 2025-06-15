import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/Header.css";
import JobizzaLogo from "../assets/Jobizza-logo.jpeg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const token = localStorage.getItem("token");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    closeMenu(); // Close the mobile menu if open
    navigate("/login"); // Redirect to login page
  };

  const getLinkClass = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/" onClick={closeMenu}>
            <img
              src={JobizzaLogo}
              alt="Jobizza Technologies"
              className="logo-img"
            />
          </a>
        </div>

        <nav className="navbar-nav desktop-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="/" className={getLinkClass("/")}>
                Home
              </a>
            </li>
            {!token ? (
              <>
                <li className="nav-item">
                  <a href="/register" className={getLinkClass("/register")}>
                    Register
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/login" className={getLinkClass("/login")}>
                    Login
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/pre-demo" className={getLinkClass("/pre-demo")}>
                    Pre-Demo
                  </a>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a
                    href="/connections"
                    className={getLinkClass("/connections")}
                  >
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  {/* Changed to button/link with onClick for logout */}
                  <a
                    href="#" // Use # or preventDefault if not a full navigation
                    onClick={handleLogout}
                    className="nav-link" // No active class for logout
                  >
                    Logout
                  </a>
                </li>
              </>
            )}
            <li className="nav-item">
              <a href="/about" className={getLinkClass("/about")}>
                About Us
              </a>
            </li>
          </ul>
        </nav>

        <button
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <nav className={`navbar-nav mobile-nav ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <a href="/" className={getLinkClass("/")} onClick={closeMenu}>
                Home
              </a>
            </li>
            {!token ? (
              <>
                <li className="nav-item">
                  <a
                    href="/register"
                    className={getLinkClass("/register")}
                    onClick={closeMenu}
                  >
                    Register
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="/login"
                    className={getLinkClass("/login")}
                    onClick={closeMenu}
                  >
                    Login
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="/pre-demo"
                    className={getLinkClass("/pre-demo")}
                    onClick={closeMenu}
                  >
                    Pre-Demo
                  </a>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a
                    href="/connections"
                    className={getLinkClass("/connections")}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  {/* Apply handleLogout to mobile logout link */}
                  <a href="#" onClick={handleLogout} className="nav-link">
                    Logout
                  </a>
                </li>
              </>
            )}
            <li className="nav-item">
              <a
                href="/about"
                className={getLinkClass("/about")}
                onClick={closeMenu}
              >
                About Us
              </a>
            </li>
          </ul>
        </nav>

        <div
          className={`navbar-overlay ${isMenuOpen ? "active" : ""}`}
          onClick={closeMenu}
        ></div>
      </div>
    </header>
  );
};

export default Header;
