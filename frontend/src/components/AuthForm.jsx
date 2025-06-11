import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// Assuming useAuth context is correctly implemented and provides login, isAuthenticated, user
import { useAuth } from "../context/AuthContext";
import '../styles/AuthForm.css'; // Import the new CSS file
import Header from "./Header"; // Import the Header component
import Footer from "./Footer"; // Import the Footer component

// Consider a default profile pic path if you want to show a preview
const DEFAULT_PROFILE_PIC = "/profile-pic-dummy.png"; // Make sure you have this image in your public folder or accessible path

function AuthForm({ isRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("CXO"); // Default role
  const [linkedin, setLinkedin] = useState("");
  const [financialCertifications, setFinancialCertifications] = useState("");
  const [yearsOfFinanceExperience, setYearsOfFinanceExperience] = useState("");
  const [industrySpecializations, setIndustrySpecializations] = useState("");
  const [keyFinancialSkills, setKeyFinancialSkills] = useState("");
  const [budgetManaged, setBudgetManaged] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // Destructure login, isAuthenticated, and user from the useAuth context
  const { login, isAuthenticated, user } = useAuth();

  const cLevelRoles = [
    "CEO", "CFO", "CTO", "CHRO", "COO", "CMO", "CIO", "CSO",
    "CPO", "CLO", "CCO", "CDO", "CRO", "CISO", "CXO", "Admin",
  ];

  // Effect to redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/connections", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]); // Dependencies for the effect

  // Handler for profile picture file input change
  const handleFileChange = (e) => {
    setProfileImageFile(e.target.files[0]);
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    setLoading(true); // Set loading state to true

    if (isRegister) {
      // Logic for user registration
      const industrySpecializationsArray = industrySpecializations
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const keyFinancialSkillsArray = keyFinancialSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const financialCertificationsArray = financialCertifications
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullName", fullName);
      formData.append("company", company);
      formData.append("designation", designation);
      formData.append("role", role);
      formData.append("linkedin", linkedin);
      formData.append(
        "financialCertifications",
        JSON.stringify(financialCertificationsArray)
      );
      formData.append("yearsOfFinanceExperience", yearsOfFinanceExperience);
      formData.append(
        "industrySpecializations",
        JSON.stringify(industrySpecializationsArray)
      );
      formData.append(
        "keyFinancialSkills",
        JSON.stringify(keyFinancialSkillsArray)
      );
      formData.append("budgetManaged", budgetManaged);

      if (profileImageFile) {
        formData.append("profilePic", profileImageFile);
      }

      try {
        const response = await fetch("/api/v1/auth/register", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(data.message + " Redirecting to login...");
          setTimeout(() => {
            navigate("/login"); // Redirect to login after successful registration
          }, 2000);
          // Clear form fields
          setEmail("");
          setPassword("");
          setFullName("");
          setCompany("");
          setDesignation("");
          setRole("CXO");
          setLinkedin("");
          setFinancialCertifications("");
          setYearsOfFinanceExperience("");
          setIndustrySpecializations("");
          setKeyFinancialSkills("");
          setBudgetManaged("");
          setProfileImageFile(null);
        } else {
          setError(data.message || "Registration failed.");
        }
      } catch (err) {
        console.error("Registration error:", err);
        setError("Network error or server unreachable.");
      } finally {
        setLoading(false); // Reset loading state
      }
    } else {
      // Logic for user login
      try {
        const res = await login(email, password, role); // Call login function from context
        if (!res.success) {
          setError(res.message);
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("Network error or server unreachable.");
      } finally {
        setLoading(false); // Reset loading state
      }
    }
  };

  // Don't render the form if the user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
    
    <div className="jobizaaa-auth-container">
      <div className="jobizaaa-auth-card">
        <h2 className="jobizaaa-auth-heading">
          {isRegister
            ? "Join Jobizaaa Network"
            : "Welcome Back to Jobizaaa Network"}
        </h2>
        <p className="jobizaaa-auth-intro-text">
          {isRegister
            ? "Connect with a vetted community of C-level executives. Complete your profile to access unparalleled networking opportunities and strategic insights."
            : "Log in to continue your engagement with top financial leaders and access your exclusive resources."}
        </p>

        {error && <p className="jobizaaa-auth-message jobizaaa-auth-error-message">{error}</p>}
        {successMessage && (
          <p className="jobizaaa-auth-message jobizaaa-auth-success-message">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="jobizaaa-auth-form">
          <div className="jobizaaa-form-group">
            <label htmlFor="email" className="jobizaaa-form-label">
              Email:
            </label>
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
          <div className="jobizaaa-form-group">
            <label htmlFor="password" className="jobizaaa-form-label">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="jobizaaa-form-input"
              aria-label="Password"
            />
          </div>

          {isRegister && (
            <>
              {/* Registration specific fields */}
              <div className="jobizaaa-form-group">
                <label htmlFor="fullName" className="jobizaaa-form-label">
                  Full Name:
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="jobizaaa-form-input"
                  aria-label="Full Name"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label htmlFor="company" className="jobizaaa-form-label">
                  Company:
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="jobizaaa-form-input"
                  aria-label="Company"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label htmlFor="designation" className="jobizaaa-form-label">
                  Designation:
                </label>
                <input
                  type="text"
                  id="designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="jobizaaa-form-input"
                  aria-label="Designation"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label htmlFor="role" className="jobizaaa-form-label">
                  Your Primary Role:
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="jobizaaa-form-input"
                  aria-label="Primary Role"
                >
                  {cLevelRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="jobizaaa-form-group">
                <label htmlFor="linkedin" className="jobizaaa-form-label">
                  LinkedIn Profile URL:
                </label>
                <input
                  type="url"
                  id="linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="jobizaaa-form-input"
                  aria-label="LinkedIn Profile URL"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label
                  htmlFor="financialCertifications"
                  className="jobizaaa-form-label"
                >
                  Financial Certifications (comma-separated):
                </label>
                <input
                  type="text"
                  id="financialCertifications"
                  value={financialCertifications}
                  onChange={(e) => setFinancialCertifications(e.target.value)}
                  className="jobizaaa-form-input"
                  aria-label="Financial Certifications"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label
                  htmlFor="yearsOfFinanceExperience"
                  className="jobizaaa-form-label"
                >
                  Years of Finance Experience:
                </label>
                <input
                  type="number"
                  id="yearsOfFinanceExperience"
                  value={yearsOfFinanceExperience}
                  onChange={(e) => setYearsOfFinanceExperience(e.target.value)}
                  className="jobizaaa-form-input"
                  aria-label="Years of Finance Experience"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label
                  htmlFor="industrySpecializations"
                  className="jobizaaa-form-label"
                >
                  Industry Specializations (comma-separated):
                </label>
                <input
                  type="text"
                  id="industrySpecializations"
                  value={industrySpecializations}
                  onChange={(e) => setIndustrySpecializations(e.target.value)}
                  className="jobizaaa-form-input"
                  aria-label="Industry Specializations"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label
                  htmlFor="keyFinancialSkills"
                  className="jobizaaa-form-label"
                >
                  Key Financial Skills (comma-separated):
                </label>
                <input
                  type="text"
                  id="keyFinancialSkills"
                  value={keyFinancialSkills}
                  onChange={(e) => setKeyFinancialSkills(e.target.value)}
                  className="jobizaaa-form-input"
                  aria-label="Key Financial Skills"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label htmlFor="budgetManaged" className="jobizaaa-form-label">
                  Budget Managed (e.g., "$1M+"):
                </label>
                <input
                  type="text"
                  id="budgetManaged"
                  value={budgetManaged}
                  onChange={(e) => setBudgetManaged(e.target.value)}
                  className="jobizaaa-form-input"
                  aria-label="Budget Managed"
                />
              </div>
              <div className="jobizaaa-form-group">
                <label htmlFor="profilePic" className="jobizaaa-form-label">
                  Profile Picture (Optional):
                </label>
                <input
                  type="file"
                  id="profilePic"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="jobizaaa-form-input-file" // A slightly different class for file input
                  aria-label="Profile Picture Upload"
                />
                {profileImageFile && (
                  <div className="jobizaaa-image-preview">
                    <img
                      src={URL.createObjectURL(profileImageFile)}
                      alt="Profile Preview"
                      className="jobizaaa-profile-pic-thumbnail"
                    />
                    <p>{profileImageFile.name}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {!isRegister && (
            <>
              <p className="jobizaaa-form-label jobizaaa-role-selection-label">Login as Role:</p>
              <div className="jobizaaa-role-cards-container">
                {/* Removed the filter so Admin role is also displayed */}
                {cLevelRoles.map((r) => (
                  <div
                    key={r}
                    className={`jobizaaa-role-card ${role === r ? "jobizaaa-role-card-selected" : ""}`}
                    onClick={() => setRole(r)}
                    tabIndex="0" // Make it focusable
                    role="button" // Indicate it's a button
                    aria-pressed={role === r} // For accessibility
                    aria-label={`Login as ${r}`}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            type="submit"
            className="jobizaaa-auth-button"
            disabled={loading}
          >
            {loading
              ? isRegister
                ? "Registering..."
                : "Logging In..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>

          {!isRegister && (
            <div className="jobizaaa-forgot-password-link">
              <Link to="/forgot-password" className="jobizaaa-link">Forgot Password?</Link>
            </div>
          )}

          <div className="jobizaaa-auth-toggle-link">
            {isRegister ? (
              <p>
                Already have an account?{" "}
                <Link to="/login" className="jobizaaa-link">
                  Login here
                </Link>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="jobizaaa-link">
                  Register here
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
      <Footer />
    </>
  );
}

export default AuthForm;
