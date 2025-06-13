import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";  // Import Header component
import Footer from "../components/Footer"; // Import Footer component
import '../styles/VerifyOtpPage.css'; // Import the new CSS file

function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, user } = useAuth();

  // Get email from location state, which should be passed from the previous page (e.g., login/register)
  const email = location.state?.email;

  // Effect to handle redirection if email is missing or user is already verified
  useEffect(() => {
    if (!email) {
      setError(
        "No email found for OTP verification. Please try logging in again."
      );
      // Redirect to login after a delay if email is not present
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return; // Exit early if no email
    }
    // If user is already authenticated and verified, redirect based on their role
    if (user && user.isVerified) {
      if (user.role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/connections", { replace: true });
      }
    }
  }, [email, navigate, user]); // Dependencies for the effect

  // Handler for OTP submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    // Basic validation
    if (!email) {
      setError("Email missing for verification. Please go back and login.");
      return;
    }

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    // Call the verifyOtp function from AuthContext
    const res = await verifyOtp(email, otp);

    if (res.success) {
      setSuccessMessage("OTP verified successfully! Redirecting...");
      // Redirect based on user role after successful verification
      if (res.user.role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/connections", { replace: true });
      }
    } else {
      setError(res.message); // Display error message from the API response
    }
  };

  // Display a loading/preparation message if email is not yet available
  if (!email) {
    return (
      <>
        <Header />
        <div className="jobizaaa-otp-container">
          <p className="jobizaaa-otp-loading-message">Preparing OTP verification...</p>
          {error && <p className="jobizaaa-otp-error-message">{error}</p>}
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header /> {/* Render Header component */}
      <div className="jobizaaa-otp-container">
        <div className="jobizaaa-otp-card">
          <h2 className="jobizaaa-otp-heading">Verify Your Email</h2>
          <p className="jobizaaa-otp-info">
            An OTP has been sent to <strong className="jobizaaa-otp-email">{email}</strong>. Please enter it below to complete
            your login.
          </p>
          {error && <p className="jobizaaa-otp-message jobizaaa-otp-error-message">{error}</p>}
          {successMessage && (
            <p className="jobizaaa-otp-message jobizaaa-otp-success-message">{successMessage}</p>
          )}
          <form onSubmit={handleSubmit} className="jobizaaa-otp-form">
            <div className="jobizaaa-otp-form-group">
              <label htmlFor="otp" className="jobizaaa-otp-form-label">
                OTP:
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="jobizaaa-otp-form-input"
                maxLength="6" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                aria-label="One-Time Password"
              />
            </div>
            <button type="submit" className="jobizaaa-otp-button">
              Verify OTP
            </button>
          </form>
        </div>
      </div>
      <Footer /> 
    </>
  );
}

export default VerifyOtpPage;
