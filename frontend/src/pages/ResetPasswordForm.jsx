import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/ResetPasswordForm.css';

function ResetPasswordForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (!token) {
      setMessage("Invalid or missing reset token.");
      return;
    }

    setMessage("Resetting password...");

    try {
      const response = await fetch(`/api/v1/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message + " Redirecting to login...");
        setIsSuccess(true);
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || "Failed to reset password.");
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
      <main className="jobizaaa-reset-password-container">
        <div className="jobizaaa-reset-password-card">
          <h2 className="jobizaaa-reset-password-heading">Reset Password</h2>

          {!token && (
            <p className="jobizaaa-reset-password-error-message">
              Invalid or missing reset token in the URL.
            </p>
          )}

          {token && (
            <>
              <p className="jobizaaa-reset-password-intro-text">
                Enter your new password below. Make sure it's strong and memorable.
              </p>
              <form onSubmit={handleSubmit} className="jobizaaa-reset-password-form">
                <div className="jobizaaa-form-group">
                  <label htmlFor="newPassword" className="jobizaaa-form-label">New Password:</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="jobizaaa-form-input"
                  />
                </div>

                <div className="jobizaaa-form-group">
                  <label htmlFor="confirmNewPassword" className="jobizaaa-form-label">Confirm New Password:</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="jobizaaa-form-input"
                  />
                </div>

                <button type="submit" className="jobizaaa-reset-password-button">
                  Reset Password
                </button>
              </form>
            </>
          )}

          {message && (
            <p className={`jobizaaa-reset-password-message ${isSuccess ? "jobizaaa-reset-password-success-message" : "jobizaaa-reset-password-error-message"}`}>
              {message}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ResetPasswordForm;
