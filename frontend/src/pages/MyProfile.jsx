import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MyProfile.css";

import ConnectionsHeader from "../components/ConnectionsHeader";

const DEFAULT_AVATAR = "/profile-pic-dummy.png";

const MyProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    profilePic: "", // This will hold the URL for preview or current image
    company: "",
    designation: "",
    linkedin: "",
    budgetManaged: "",
    yearsOfFinanceExperience: "",
    financialCertifications: [],
    industrySpecializations: [],
    keyFinancialSkills: [],
    // Bio field removed as per request
  });

  const [selectedFile, setSelectedFile] = useState(null); // Holds the actual file object

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccessMessage, setModalSuccessMessage] = useState(null);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await axios.get("/api/v1/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserProfile(response.data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401) {
            setError(
              err.response.data.message ||
                "Session expired or invalid token. Please log in again."
            );
          } else {
            setError(
              err.response.data.message || "Failed to fetch user profile."
            );
          }
        } else if (err.request) {
          setError(
            "No response from server. Please check your backend connection."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  useEffect(() => {
    if (isModalOpen && userProfile) {
      setFormData({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        profilePic: userProfile.profilePic || "", // Current profile pic URL for display
        company: userProfile.company || "",
        designation: userProfile.designation || "",
        linkedin: userProfile.linkedin || "",
        budgetManaged: userProfile.budgetManaged || "",
        yearsOfFinanceExperience: userProfile.yearsOfFinanceExperience || "",
        financialCertifications: userProfile.financialCertifications || [],
        industrySpecializations: userProfile.industrySpecializations || [],
        keyFinancialSkills: userProfile.keyFinancialSkills || [],
        // Bio field omitted here
      });
      setSelectedFile(null); // Clear any previously selected file
      setModalError(null);
      setModalSuccessMessage(null);
    }
  }, [isModalOpen, userProfile]);

  const handleUpdateProfileClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles file selection for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Store the actual file object
      setFormData((prevData) => ({
        ...prevData,
        profilePic: URL.createObjectURL(file), // Create a temporary URL for immediate preview
      }));
    } else {
      setSelectedFile(null); // No file selected, clear it
      // Revert profilePic in formData to original or default if no new file selected
      setFormData((prevData) => ({
        ...prevData,
        profilePic: userProfile.profilePic || DEFAULT_AVATAR,
      }));
    }
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    setModalSuccessMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type will be set automatically by Axios for FormData
        },
      };

      let dataToSend;

      if (selectedFile) {
        // If a new file is selected, create FormData to send the file and other fields
        const formDataPayload = new FormData();
        formDataPayload.append("profilePic", selectedFile); // Append the file with key 'profilePic'

        // Append other non-file form fields. Exclude 'email' as it's not user-editable.
        Object.keys(formData).forEach((key) => {
          if (key !== "profilePic" && key !== "email") {
            // Do not append profilePic URL or email
            if (Array.isArray(formData[key])) {
              // For array fields, append each item separately (backend should handle as array)
              formData[key].forEach((item) =>
                formDataPayload.append(`${key}[]`, item)
              );
            } else {
              // For other fields, just append them
              formDataPayload.append(key, formData[key]);
            }
          }
        });
        dataToSend = formDataPayload; // Set dataToSend to FormData object
      } else {
        // If no new file is selected, send data as JSON
        const { ...restFormData } = formData; // Exclude email and profilePic (as it's a URL here)
        dataToSend = restFormData; // Set dataToSend to plain object
        config.headers["Content-Type"] = "application/json"; // Explicitly set Content-Type for JSON
      }

      const response = await axios.put(
        "/api/v1/users/updateProfile",
        dataToSend,
        config
      );

      setModalSuccessMessage(
        response.data.message || "Profile updated successfully!"
      );
      await fetchMyProfile(); // Re-fetch profile data to show updates on the main page
      setTimeout(() => {
        setIsModalOpen(false); // Close the modal after a short delay
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setModalError(
            err.response.data.message ||
              "Failed to update profile. Please try again."
          );
        } else if (err.request) {
          setModalError("No response from server. Check backend connection.");
        } else {
          setModalError(err.message);
        }
      } else {
        setModalError(err.message);
      }
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading-spinner-wrapper">
          <div className="profile-loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error-container">
        <div className="profile-error-card">
          <h2 className="profile-error-heading">Error loading profile</h2>
          <p className="profile-error-message">{error}</p>
          {error.includes("log in again") && (
            <p className="profile-login-prompt">
              Please{" "}
              <a href="/login" className="profile-login-link">
                log in
              </a>{" "}
              to view your profile.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="profile-no-data-container">
        <div className="profile-error-card">
          <p className="profile-no-data-message">
            Your profile data is not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="user-profile-page-wrapper">
        <div className="profile-section-card profile-header-area">
          <div className="profile-banner-image"></div>
          <div className="profile-header-content-area">
            <div className="profile-avatar-container">
              <img
                src={userProfile.profilePic || DEFAULT_AVATAR}
                alt="Profile"
                className="profile-avatar-img"
              />
              <div className="profile-badges-wrapper">
                {userProfile.isVerified && (
                  <span className="profile-badge profile-badge-verified">
                    ✓ Verified
                  </span>
                )}
                {userProfile.isApproved && (
                  <span className="profile-badge profile-badge-approved">
                    ✓ Approved
                  </span>
                )}
              </div>
            </div>
            <div className="profile-main-info">
              <h1 className="profile-full-name">{userProfile.fullName}</h1>
              <p className="profile-designation-text">
                {userProfile.designation}
              </p>
              <p className="profile-company-text">{userProfile.company}</p>
              <p className="profile-role-text">{userProfile.role}</p>
              <div className="profile-action-buttons">
                <button
                  className="profile-edit-button"
                  onClick={handleUpdateProfileClick}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section-card profile-about-section">
          <h2 className="profile-section-title">About</h2>
          <div className="profile-about-details-grid">
            <div className="profile-about-detail-item">
              <span className="profile-about-label">Email</span>
              <span className="profile-about-value">{userProfile.email}</span>
            </div>
            <div className="profile-about-detail-item">
              <span className="profile-about-label">Experience</span>
              <span className="profile-about-value">
                {userProfile.yearsOfFinanceExperience} years
              </span>
            </div>
            <div className="profile-about-detail-item">
              <span className="profile-about-label">Budget Managed</span>
              <span className="profile-about-value">
                {userProfile.budgetManaged}
              </span>
            </div>
            <div className="profile-about-detail-item">
              <span className="profile-about-label">Member Since</span>
              <span className="profile-about-value">
                {new Date(userProfile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          {userProfile.linkedin && (
            <div className="profile-linkedin-area">
              <a
                href={userProfile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="profile-linkedin-link"
              >
                <svg
                  className="profile-linkedin-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                View LinkedIn Profile
              </a>
            </div>
          )}
        </div>

        <div className="profile-section-card profile-skills-certifications-section">
          <h2 className="profile-section-title">Skills & Expertise</h2>

          {userProfile.keyFinancialSkills &&
            userProfile.keyFinancialSkills.length > 0 && (
              <div className="profile-skill-category">
                <h3 className="profile-subsection-title">
                  Key Financial Skills
                </h3>
                <div className="profile-skills-tags-list">
                  {userProfile.keyFinancialSkills.map((skill, index) => (
                    <span key={index} className="profile-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {userProfile.industrySpecializations &&
            userProfile.industrySpecializations.length > 0 && (
              <div className="profile-skill-category">
                <h3 className="profile-subsection-title">
                  Industry Specializations
                </h3>
                <div className="profile-skills-tags-list">
                  {userProfile.industrySpecializations.map(
                    (industry, index) => (
                      <span
                        key={index}
                        className="profile-skill-tag profile-industry-tag"
                      >
                        {industry}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

          {userProfile.financialCertifications &&
            userProfile.financialCertifications.length > 0 && (
              <div className="profile-skill-category">
                <h3 className="profile-subsection-title">
                  Financial Certifications
                </h3>
                <div className="profile-certifications-list">
                  {userProfile.financialCertifications.map((cert, index) => (
                    <div key={index} className="profile-certification-item">
                      <span className="profile-certification-icon">🏆</span>
                      <span className="profile-certification-name">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Edit Profile</h2>
                <button
                  className="modal-close-button"
                  onClick={handleCloseModal}
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profilePicFile">Change Profile Picture</label>
                  <input
                    type="file"
                    id="profilePicFile"
                    name="profilePicFile" // This name is for the file input
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {/* Image preview based on formData.profilePic (which can be URL.createObjectURL) */}
                  {formData.profilePic && (
                    <div className="profile-pic-preview">
                      <img
                        src={formData.profilePic || DEFAULT_AVATAR}
                        alt="Profile Preview"
                        className="preview-image"
                      />
                      <p>Current/New Image</p>
                    </div>
                  )}
                </div>
                {/* Removed Bio field */}
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="designation">Designation</label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="linkedin">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="e.g., https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="budgetManaged">Budget Managed</label>
                  <input
                    type="text"
                    id="budgetManaged"
                    name="budgetManaged"
                    value={formData.budgetManaged}
                    onChange={handleChange}
                    placeholder="e.g., $1M - $5M"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="yearsOfFinanceExperience">
                    Years of Finance Experience
                  </label>
                  <input
                    type="number"
                    id="yearsOfFinanceExperience"
                    name="yearsOfFinanceExperience"
                    value={formData.yearsOfFinanceExperience}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="financialCertifications">
                    Financial Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="financialCertifications"
                    name="financialCertifications"
                    value={formData.financialCertifications.join(", ")}
                    onChange={handleArrayChange}
                    placeholder="e.g., CFA, FRM, CPA"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="industrySpecializations">
                    Industry Specializations (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="industrySpecializations"
                    name="industrySpecializations"
                    value={formData.industrySpecializations.join(", ")}
                    onChange={handleArrayChange}
                    placeholder="e.g., Fintech, Real Estate, Healthcare"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="keyFinancialSkills">
                    Key Financial Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="keyFinancialSkills"
                    name="keyFinancialSkills"
                    value={formData.keyFinancialSkills.join(", ")}
                    onChange={handleArrayChange}
                    placeholder="e.g., Financial Modeling, Data Analysis, Risk Management"
                  />
                </div>

                {modalLoading && (
                  <p className="modal-message loading-message">
                    Updating profile...
                  </p>
                )}
                {modalError && (
                  <p className="modal-message error-message">{modalError}</p>
                )}
                {modalSuccessMessage && (
                  <p className="modal-message success-message">
                    {modalSuccessMessage}
                  </p>
                )}

                <div className="modal-actions">
                  <button
                    type="submit"
                    className="modal-save-button"
                    disabled={modalLoading}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="modal-cancel-button"
                    onClick={handleCloseModal}
                    disabled={modalLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyProfile;
