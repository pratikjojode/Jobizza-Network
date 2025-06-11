import React, { useState } from 'react';
import '../styles/Header.css'; 
import JobizzaLogo from '../assets/Jobizza-logo.jpeg'; 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
              <a href="/" className="nav-link">Home</a>
            </li>
            <li className="nav-item">
              <a href="/Register" className="nav-link">Register</a>
            </li>
            <li className="nav-item">
              <a href="/login" className="nav-link">Login</a>
            </li>
            <li className="nav-item">
              <a href="/pre-demo" className="nav-link">Pre-Demo</a>
            </li>
            <li className="nav-item">
              <a href="/about" className="nav-link">About Us</a>
            </li>
          </ul>
        </nav>

        
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        
        <nav className={`navbar-nav mobile-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <a href="/" className="nav-link" onClick={closeMenu}>Home</a>
            </li>
            <li className="nav-item">
              <a href="/register" className="nav-link" onClick={closeMenu}>Register</a>
            </li>
            <li className="nav-item">
              <a href="/login" className="nav-link" onClick={closeMenu}>Login</a>
            </li>
            <li className="nav-item">
              <a href="/pre-demo" className="nav-link" onClick={closeMenu}>Pre-Demo</a>
            </li>
            <li className="nav-item">
              <a href="/about" className="nav-link" onClick={closeMenu}>About Us</a>
            </li>
          </ul>
        </nav>

        
        <div 
          className={`navbar-overlay ${isMenuOpen ? 'active' : ''}`}
          onClick={closeMenu}
        ></div>
      </div>
    </header>
  );
};

export default Header;