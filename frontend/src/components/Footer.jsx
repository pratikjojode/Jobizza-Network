import React from "react";
import { FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import "../styles/Footer.css"; 
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>Jobizza Network</h2>
          <p>The Exclusive Platform for C-Suite Leaders</p>
          <div className="social-icons">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="icon" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="icon" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <FaYoutube className="icon" />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="links-column">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/network">Network</a></li>
              <li><a href="/insights">Insights</a></li>
            </ul>
          </div>
          <div className="links-column">
            <h3>Resources</h3>
            <ul>
              <li><a href="/events">Events</a></li>
              <li><a href="/articles">Articles</a></li>
              <li><a href="/podcasts">Podcasts</a></li>
              <li><a href="/webinars">Webinars</a></li>
            </ul>
          </div>
          <div className="links-column">
            <h3>Company</h3>
            <ul>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Jobizza Network. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;