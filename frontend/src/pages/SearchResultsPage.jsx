import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom"; // Add Link here
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/SearchResultsPage.css";
import ConnectionsHeader from "../components/ConnectionsHeader";

const SearchResultsPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryParams = new URLSearchParams(search);
  const searchTerm = queryParams.get("q") || "";
  const searchFilter = queryParams.get("filter") || "all";

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();

    if (!headers) {
      setError("Please log in to view search results.");
      setLoading(false);
      logout();
      return;
    }

    if (!searchTerm) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `/api/v1/search?q=${encodeURIComponent(
          searchTerm
        )}&filter=${searchFilter}`,
        { headers }
      );
      setSearchResults(response.data.data.results);
    } catch (err) {
      console.error("Error fetching search results:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to load search results.";

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired or unauthorized. Please log in again.");
        logout();
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchFilter, getAuthHeaders, logout]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  if (loading) {
    return (
      <>
        <ConnectionsHeader />
        <div className="search-results-container loading-state">
          <div className="loading-spinner"></div>
          <p>Searching for "{searchTerm}"...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ConnectionsHeader />
        <div className="search-results-container error-state">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-back">
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConnectionsHeader />
      <div className="search-results-container">
        <h2>
          Search Results for "{searchTerm}" ({searchFilter})
        </h2>
        {searchResults.length === 0 ? (
          <div className="no-results-state">
            <p>No results found for your search query.</p>
            <button
              onClick={() => navigate("/connections")}
              className="btn btn-primary"
            >
              Browse Connections
            </button>
          </div>
        ) : (
          <div className="results-list">
            {searchResults.map((result) => (
              <div key={result._id} className="search-result-card">
                <div className="result-avatar">
                  {result.profilePic ? (
                    <img src={result.profilePic} alt={result.fullName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {result.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="result-info">
                  <h3>
                    <Link to={`/users/${result._id}`} className="result-name">
                      {result.fullName}
                    </Link>
                  </h3>
                  {result.designation && (
                    <p className="result-meta">{result.designation}</p>
                  )}
                  {result.company && (
                    <p className="result-meta">at {result.company}</p>
                  )}
                  {result.email && (
                    <p className="result-contact">{result.email}</p>
                  )}
                </div>
                <div className="result-actions">
                  <Link
                    to={`/profile/${result._id}`}
                    className="btn btn-view-profile"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResultsPage;
