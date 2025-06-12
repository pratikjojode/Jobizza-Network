
import '../styles/AboutUs.css'; // Assuming you have a CSS file for styles
import Header from './Header'; // Import your Header component
import Footer from './Footer'; // Import your Footer component if needed
import React, { useEffect } from 'react';


const AboutUs = () => {
  useEffect(() => {
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate');
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
          element.classList.add('animated');
        }
      });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
    
    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);

  return (
    <>
      <Header />
    
    <div className="about-us-container">
      {/* Hero Section */}
      <section className="about-hero animate">
        <div className="hero-content">
          <h1>About Jobizza Network</h1>
          <p className="hero-subtitle">Redefining Executive Networking for the Digital Age</p>
          <div className="scroll-indicator">
            <div className="mouse"></div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content animate">
            <h2>Our Mission</h2>
            <p>
              At Jobizza Network, we're transforming how C-suite executives connect, collaborate, and grow. 
              Our platform bridges the gap between top-tier talent and exclusive opportunities in a secure, 
              verified environment designed specifically for executive leadership.
            </p>
          </div>
          <div className="mission-image animate">
            <div className="image-placeholder"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stat-item animate">
            <div className="stat-circle">
              <h3 data-count="10000">0</h3>
              <span>+</span>
            </div>
            <p>Verified C-Suite Members</p>
          </div>
          <div className="stat-item animate">
            <div className="stat-circle">
              <h3 data-count="120">0</h3>
              <span>+</span>
            </div>
            <p>Countries Represented</p>
          </div>
          <div className="stat-item animate">
            <div className="stat-circle">
              <h3 data-count="85">0</h3>
              <span>%</span>
            </div>
            <p>Members Who Found Valuable Connections</p>
          </div>
          <div className="stat-item animate">
            <div className="stat-circle">
              <h3 data-count="500">0</h3>
              <span>+</span>
            </div>
            <p>Exclusive Events Yearly</p>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="value-section">
        <div className="container">
          <h2 className="animate">Why Jobizza Network Stands Apart</h2>
          <div className="value-grid">
            <div className="value-card animate">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Exclusive Verification</h3>
              <p>Every member undergoes rigorous verification to ensure the highest quality network.</p>
            </div>
            <div className="value-card animate">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Strategic Opportunities</h3>
              <p>Access to board positions, speaking engagements, and partnerships tailored for executives.</p>
            </div>
            <div className="value-card animate">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Private Knowledge Hub</h3>
              <p>Proprietary research and benchmarks available only to our members.</p>
            </div>
            <div className="value-card animate">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Global Reach</h3>
              <p>Connect with peers across industries and geographies with similar challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="team-section">
        <div className="container">
          <h2 className="animate">Our Leadership</h2>
          <div className="team-grid">
            <div className="team-card animate">
              <div className="team-photo">
                <div className="photo-overlay">
                  <button className="view-profile">View Profile</button>
                </div>
              </div>
              <h3>John Smith</h3>
              <p className="position">Co-Founder & CEO</p>
              <p className="bio">Former Fortune 500 CTO with 20+ years in executive networking technology.</p>
            </div>
            <div className="team-card animate">
              <div className="team-photo">
                <div className="photo-overlay">
                  <button className="view-profile">View Profile</button>
                </div>
              </div>
              <h3>Sarah Johnson</h3>
              <p className="position">Co-Founder & COO</p>
              <p className="bio">Executive search veteran specializing in C-suite placements across industries.</p>
            </div>
            <div className="team-card animate">
              <div className="team-photo">
                <div className="photo-overlay">
                  <button className="view-profile">View Profile</button>
                </div>
              </div>
              <h3>Michael Chen</h3>
              <p className="position">Chief Product Officer</p>
              <p className="bio">Product leader with expertise in building professional networking platforms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Team */}
      <section className="dev-team-section">
        <div className="container">
          <h2 className="animate">The Minds Behind the Platform</h2>
          <div className="dev-team-grid">
            <div className="dev-card animate">
              <div className="dev-photo"></div>
              <h3>Alex Rodriguez</h3>
              <p className="position">Lead Frontend Developer</p>
              <div className="social-links">
                <a href="#"><i className="icon-linkedin"></i></a>
                <a href="#"><i className="icon-github"></i></a>
              </div>
            </div>
            <div className="dev-card animate">
              <div className="dev-photo"></div>
              <h3>Priya Patel</h3>
              <p className="position">Backend Architect</p>
              <div className="social-links">
                <a href="#"><i className="icon-linkedin"></i></a>
                <a href="#"><i className="icon-github"></i></a>
              </div>
            </div>
            <div className="dev-card animate">
              <div className="dev-photo"></div>
              <h3>David Kim</h3>
              <p className="position">UX/UI Designer</p>
              <div className="social-links">
                <a href="#"><i className="icon-linkedin"></i></a>
                <a href="#"><i className="icon-github"></i></a>
              </div>
            </div>
            <div className="dev-card animate">
              <div className="dev-photo"></div>
              <h3>Emily Wilson</h3>
              <p className="position">Security Specialist</p>
              <div className="social-links">
                <a href="#"><i className="icon-linkedin"></i></a>
                <a href="#"><i className="icon-github"></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate">
        <div className="container">
          <h2>Ready to Join the Premier Network for C-Suite Leaders?</h2>
          <p>Take the first step toward expanding your influence and accessing unparalleled executive connections.</p>
          <div className="cta-buttons">
            <button className="primary-btn hover-effect">Register Now</button>
            <button className="secondary-btn hover-effect">Learn More</button>
          </div>
        </div>
      </section>
    </div>
      <Footer />
    </>
  );
};

export default AboutUs;