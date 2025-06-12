import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/ForgotPasswordForm.css';

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Sending...");
    setIsSuccess(false);

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
        setEmail("");
      } else {
        setMessage(data.message || "Something went wrong.");
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
      <Header />
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h2 className="forgot-password-heading">Forgot Password</h2>
          <p className="forgot-password-text">
            Enter your email address below and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <label htmlFor="email" className="forgot-password-label">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="forgot-password-input"
              aria-label="Email address"
              placeholder="example@domain.com"
            />
            <button type="submit" className="forgot-password-button">
              Send Reset Link
            </button>
          </form>

          {message && (
            <p className={`forgot-password-message ${isSuccess ? "success" : "error"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForgotPasswordForm;
