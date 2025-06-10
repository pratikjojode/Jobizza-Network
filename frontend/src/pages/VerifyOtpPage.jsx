import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, user } = useAuth();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      setError(
        "No email found for OTP verification. Please try logging in again."
      );
      setTimeout(() => navigate("/login"), 3000);
    }
    if (user && user.isVerified) {
      if (user.role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/connections", { replace: true });
      }
    }
  }, [email, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Email missing for verification. Please go back and login.");
      return;
    }

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    const res = await verifyOtp(email, otp);

    if (res.success) {
      setSuccessMessage("OTP verified successfully! Redirecting...");
      if (res.user.role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/connections", { replace: true });
      }
    } else {
      setError(res.message);
    }
  };

  if (!email) {
    return (
      <div className="verify-otp-container">
        <p>Preparing OTP verification...</p>
        {error && <p className="otp-error-message">{error}</p>}
      </div>
    );
  }

  return (
    <div className="verify-otp-container">
      <h2 className="otp-heading">Verify Your Email</h2>
      <p className="otp-info">
        An OTP has been sent to **{email}**. Please enter it below to complete
        your login.
      </p>
      {error && <p className="otp-error-message">{error}</p>}
      {successMessage && (
        <p className="otp-success-message">{successMessage}</p>
      )}
      <form onSubmit={handleSubmit} className="otp-form">
        <div className="form-group">
          <label htmlFor="otp" className="form-label">
            OTP:
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="form-input"
            maxLength="6"
          />
        </div>
        <button type="submit" className="otp-button">
          Verify OTP
        </button>
      </form>
    </div>
  );
}

export default VerifyOtpPage;
