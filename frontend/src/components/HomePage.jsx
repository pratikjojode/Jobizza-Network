import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/HomePage.css";

function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <div className="home-container">
        <header className="hero-section">
          <h1 className="hero-heading">
            Jobizza Network: The Exclusive Platform for C-Suite Leaders
          </h1>
          <p className="hero-subheading">
            Connect, collaborate, and grow with the most influential executives
            in your industry
          </p>
          {!user && (
            <div className="cta-buttons">
              <Link to="/register" className="cta-button primary">
                Join Now
              </Link>
              <Link to="/login" className="cta-button secondary">
                Sign In
              </Link>
            </div>
          )}
        </header>

        <section className="why-join-section animated-section">
          <div className="section-header">
            <h2>Why Join Jobizza Network?</h2>
            <p className="section-subtitle">
              Elevate your executive presence and unlock unparalleled
              opportunities
            </p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z" />
                </svg>
              </div>
              <h3>Exclusive Peer Network</h3>
              <p>
                Connect with verified C-level executives across industries in a
                private, high-trust environment.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </div>
              <h3>Strategic Opportunities</h3>
              <p>
                Discover board positions, speaking engagements, and partnerships
                tailored to your expertise.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </div>
              <h3>Executive Insights</h3>
              <p>
                Access proprietary research, benchmarks, and discussions you
                won't find elsewhere.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z" />
                </svg>
              </div>
              <h3>Verified Community</h3>
              <p>
                Every member undergoes strict verification to ensure quality
                connections.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z" />
                </svg>
              </div>
              <h3>Private Events</h3>
              <p>
                Attend invite-only roundtables, masterminds, and networking
                sessions.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                </svg>
              </div>
              <h3>Knowledge Sharing</h3>
              <p>
                Contribute to and learn from peer discussions on leadership
                challenges.
              </p>
            </div>
          </div>
        </section>

        <section className="executive-roles">
          <div className="section-header">
            <h2>Who Joins Jobizza Network?</h2>
            <p className="section-subtitle">
              Our platform brings together the complete C-suite ecosystem
            </p>
          </div>
          <div className="roles-grid">
            {[
              "CEO",
              "CFO",
              "CTO",
              "CHRO",
              "COO",
              "CMO",
              "CIO",
              "CSO",
              "CPO",
              "CLO",
              "CCO",
              "CDO",
              "CRO",
              "CISO",
              "CXO",
            ].map((role) => (
              <div key={role} className="role-pill">
                {role}
              </div>
            ))}
          </div>
        </section>

        <section className="testimonial-section">
          <div className="section-header">
            <h2>Trusted by Industry Leaders</h2>
            <p className="section-subtitle">
              Hear what our members say about their experience
            </p>
          </div>
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "Jobizza Network has transformed how I connect with peers. The
                  quality of discussions is unparalleled."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar"></div>
                  <div>
                    <p className="author-name">Sarah K.</p>
                    <p className="author-title">CFO at Fortune 500 Company</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "I've found three board opportunities through Jobizza that
                  perfectly matched my expertise."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar"></div>
                  <div>
                    <p className="author-name">Michael T.</p>
                    <p className="author-title">Former CEO, Tech Industry</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section animated-section">
          <div className="section-header">
            <h2>Powerful Features for Executive Networking</h2>
            <p className="section-subtitle">
              Designed specifically for C-level professionals
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Verified Profiles</h3>
              <p>
                Every member is thoroughly vetted to ensure you're connecting
                with genuine executives.
              </p>
            </div>
            <div className="feature-card">
              <h3>Targeted Search</h3>
              <p>
                Find executives by role, industry, expertise, or specific
                challenges they've solved.
              </p>
            </div>
            <div className="feature-card">
              <h3>Private Discussions</h3>
              <p>
                Engage in confidential conversations with peers facing similar
                challenges.
              </p>
            </div>
            <div className="feature-card">
              <h3>Executive Insights</h3>
              <p>
                Access proprietary research and benchmarks relevant to your
                role.
              </p>
            </div>
            <div className="feature-card">
              <h3>Board Opportunities</h3>
              <p>
                Discover board positions matched to your expertise and
                interests.
              </p>
            </div>
            <div className="feature-card">
              <h3>Exclusive Events</h3>
              <p>
                Participate in invite-only roundtables and networking sessions.
              </p>
            </div>
          </div>
        </section>

        {user ? (
          <section className="user-welcome">
            <h2>Welcome back, {user.fullName || user.email}!</h2>
            <p className="welcome-subtitle">Continue your executive journey</p>
            <div className="user-actions">
              <Link to="/connections" className="action-button">
                Go to My Connections
              </Link>
              <Link to="/feed" className="action-button">
                View Latest Insights
              </Link>
              {user.role === "Admin" && (
                <Link to="/admin/dashboard" className="action-button admin">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </section>
        ) : (
          <section className="final-cta">
            <div className="cta-content">
              <h2>Ready to Join the Premier Network for C-Suite Leaders?</h2>
              <p>
                Take the first step toward expanding your influence and
                accessing unparalleled executive connections.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="cta-button primary">
                  Register Now
                </Link>
                <Link to="/login" className="cta-button secondary">
                  Sign In
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}

export default HomePage;
