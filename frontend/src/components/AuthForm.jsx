import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthForm({ isRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("CXO");
  const [linkedin, setLinkedin] = useState("");
  const [financialCertifications, setFinancialCertifications] = useState("");
  const [yearsOfFinanceExperience, setYearsOfFinanceExperience] = useState("");
  const [industrySpecializations, setIndustrySpecializations] = useState("");
  const [keyFinancialSkills, setKeyFinancialSkills] = useState("");
  const [budgetManaged, setBudgetManaged] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth();

  const cLevelRoles = [
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
    "Admin",
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/connections", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (isRegister) {
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

      const res = await register({
        email,
        password,
        fullName,
        company,
        designation,
        role,
        linkedin,
        financialCertifications: financialCertificationsArray,
        yearsOfFinanceExperience: parseInt(yearsOfFinanceExperience, 10) || 0,
        industrySpecializations: industrySpecializationsArray,
        keyFinancialSkills: keyFinancialSkillsArray,
        budgetManaged,
      });

      if (res.success) {
        setSuccessMessage(res.message + " Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
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
      } else {
        setError(res.message);
      }
    } else {
      const res = await login(email, password, role);
      if (!res.success) {
        setError(res.message);
      }
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="auth-container">
      <h2 className="auth-heading">
        {isRegister
          ? "Join Jobizaaa Network"
          : "Welcome Back to Jobizaaa Network"}
      </h2>
      <p className="auth-intro-text">
        {isRegister
          ? "Connect with a vetted community of C-level executives. Complete your profile to access unparalleled networking opportunities and strategic insights."
          : "Log in to continue your engagement with top financial leaders and access your exclusive resources."}
      </p>
      {error && <p className="auth-error-message">{error}</p>}
      {successMessage && (
        <p className="auth-success-message">{successMessage}</p>
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        {isRegister && (
          <>
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name:
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Company:
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="designation" className="form-label">
                Designation:
              </label>
              <input
                type="text"
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Role:
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
              >
                {cLevelRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="linkedin" className="form-label">
                LinkedIn Profile URL:
              </label>
              <input
                type="url"
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="financialCertifications" className="form-label">
                Financial Certifications (comma-separated):
              </label>
              <input
                type="text"
                id="financialCertifications"
                value={financialCertifications}
                onChange={(e) => setFinancialCertifications(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="yearsOfFinanceExperience" className="form-label">
                Years of Finance Experience:
              </label>
              <input
                type="number"
                id="yearsOfFinanceExperience"
                value={yearsOfFinanceExperience}
                onChange={(e) => setYearsOfFinanceExperience(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="industrySpecializations" className="form-label">
                Industry Specializations (comma-separated):
              </label>
              <input
                type="text"
                id="industrySpecializations"
                value={industrySpecializations}
                onChange={(e) => setIndustrySpecializations(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="keyFinancialSkills" className="form-label">
                Key Financial Skills (comma-separated):
              </label>
              <input
                type="text"
                id="keyFinancialSkills"
                value={keyFinancialSkills}
                onChange={(e) => setKeyFinancialSkills(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="budgetManaged" className="form-label">
                Budget Managed (e.g., "$1M+"):
              </label>
              <input
                type="text"
                id="budgetManaged"
                value={budgetManaged}
                onChange={(e) => setBudgetManaged(e.target.value)}
                className="form-input"
              />
            </div>
          </>
        )}
        {!isRegister && (
          <div className="form-group">
            <label htmlFor="loginRole" className="form-label">
              Login as Role:
            </label>
            <select
              id="loginRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
            >
              {cLevelRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" className="auth-button">
          {isRegister ? "Register" : "Login"}
        </button>
        {!isRegister && (
          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        )}
      </form>
    </div>
  );
}

export default AuthForm;
