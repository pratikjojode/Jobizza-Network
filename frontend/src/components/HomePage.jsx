import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <h1 className="home-heading">
        Welcome to Jobizaaa Network: Your Premier Hub for Financial Leaders
      </h1>
      <p className="home-description">
        **Jobizaaa Network** is an exclusive platform designed for top-tier
        finance professionals. Connect with CXOs, CFOs, CEOs, and other senior
        leaders to forge powerful connections, share cutting-edge industry
        insights, and unlock unparalleled career and business growth
        opportunities.
      </p>

      <div className="home-features">
        <h2>What You'll Discover:</h2>
        <ul>
          <li>
            **Elite Networking:** Directly connect with seasoned financial
            experts and decision-makers.
          </li>
          <li>
            **Strategic Partnerships:** Identify collaborators and mentors
            tailored to your industry and expertise.
          </li>
          <li>
            **In-depth Insights:** Engage in discussions and gain knowledge from
            a curated community of financial thought leaders.
          </li>
          <li>
            **Career Advancement:** Explore roles and opportunities that align
            with your unique financial skills and experience.
          </li>
        </ul>
      </div>

      <div className="home-button-group">
        {user ? (
          <>
            <p className="home-greeting">
              Welcome back, **{user.fullName || user.email}**!
            </p>
            <Link to="/connections" className="home-button">
              Go to My Connections
            </Link>
            {user.role === "Admin" && (
              <Link to="/admin/dashboard" className="home-button admin-button">
                Admin Dashboard
              </Link>
            )}
          </>
        ) : (
          <>
            <p className="home-call-to-action">
              Ready to elevate your financial network?
            </p>
            <Link to="/login" className="home-button">
              Login
            </Link>
            <Link to="/register" className="home-button">
              Register Now
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;
