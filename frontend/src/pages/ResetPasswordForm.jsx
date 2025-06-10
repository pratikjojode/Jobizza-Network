import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
        navigate("/login");
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
    <div>
      <h2>Reset Password</h2>
      {!token && (
        <p style={{ color: "red" }}>
          Invalid or missing reset token in the URL.
        </p>
      )}
      {token && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
      {message && (
        <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>
      )}
    </div>
  );
}

export default ResetPasswordForm;
