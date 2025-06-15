import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/AdminProfile.css";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get("/api/v1/admin/adminProfile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmin(response.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch admin profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [token]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your profile?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete("/api/v1/admin/delete", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Profile deleted successfully");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete profile");
    }
  };

  const handleUpdateRedirect = () => {
    navigate("/admin/update-profile"); // Ensure this route exists
  };

  if (loading) return <p>Loading...</p>;
  if (!admin) return <p>No profile data found.</p>;

  return (
    <div className="admin-profile-container">
      <h2>Admin Profile</h2>

      {admin.profilePic && (
        <img
          src={admin.profilePic}
          alt="Admin Profile"
          className="admin-profile-image"
        />
      )}

      <p>
        <strong>Name:</strong> {admin.fullName}
      </p>
      <p>
        <strong>Email:</strong> {admin.email}
      </p>
      <p>
        <strong>Company:</strong> {admin.company || "N/A"}
      </p>
      <p>
        <strong>Designation:</strong> {admin.designation || "N/A"}
      </p>
      <p>
        <strong>Role:</strong> {admin.role}
      </p>
      <p>
        <strong>LinkedIn:</strong>{" "}
        <a href={admin.linkedin} target="_blank" rel="noopener noreferrer">
          {admin.linkedin}
        </a>
      </p>
      <p>
        <strong>Is Verified:</strong> {admin.isVerified ? "Yes" : "No"}
      </p>
      <p>
        <strong>Is Approved:</strong> {admin.isApproved ? "Yes" : "No"}
      </p>
      <p>
        <strong>Years of Finance Experience:</strong>{" "}
        {admin.yearsOfFinanceExperience || "N/A"}
      </p>
      <p>
        <strong>Budget Managed:</strong> {admin.budgetManaged || "N/A"}
      </p>

      {admin.financialCertifications?.length > 0 && (
        <div>
          <strong>Financial Certifications:</strong>
          <ul>
            {admin.financialCertifications.map((cert, idx) => (
              <li key={idx}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {admin.industrySpecializations?.length > 0 && (
        <div>
          <strong>Industry Specializations:</strong>
          <ul>
            {admin.industrySpecializations.map((spec, idx) => (
              <li key={idx}>{spec}</li>
            ))}
          </ul>
        </div>
      )}

      {admin.keyFinancialSkills?.length > 0 && (
        <div>
          <strong>Key Financial Skills:</strong>
          <ul>
            {admin.keyFinancialSkills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="profile-buttons">
        <button onClick={handleUpdateRedirect}>Update Profile</button>
        <button onClick={handleDelete}>Delete Profile</button>
      </div>
    </div>
  );
};

export default AdminProfile;
