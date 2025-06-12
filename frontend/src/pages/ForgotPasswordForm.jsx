import React, { useState } from "react";
import Header from "../components/Header"; // Import Header component
import Footer from "../components/Footer"; // Import Footer component
import '../styles/ForgotPasswordForm.css'; // Import the new CSS file

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Sending..."); // Set a sending message
    setIsSuccess(false); // Reset success status

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setEmail(""); // Clear email field on success
      } else {
        setMessage(data.message || "Something went wrong."); // Display error message from backend or a generic one
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage("Network error. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <>
      <Header /> {/* Render Header component */}
      <div className="jobizaaa-forgot-password-container">
        <div className="jobizaaa-forgot-password-card">
          <h2 className="jobizaaa-forgot-password-heading">Forgot Password</h2>
          <p className="jobizaaa-forgot-password-intro-text">
            Enter your email address below, and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="jobizaaa-forgot-password-form">
            <div className="jobizaaa-form-group">
              <label htmlFor="email" className="jobizaaa-form-label">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="jobizaaa-form-input"
                aria-label="Email address"
              />
            </div>
            <button type="submit" className="jobizaaa-forgot-password-button">
              Send Reset Link
            </button>
          </form>

          {message && (
            <p className={`jobizaaa-forgot-password-message ${isSuccess ? "jobizaaa-forgot-password-success-message" : "jobizaaa-forgot-password-error-message"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
      <Footer /> {/* Render Footer component */}
    </>
  );
}

export default ForgotPasswordForm;
