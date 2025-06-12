import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFound.css";

function NotFound() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-heading">404 - Page Not Found</h1>
      <p className="not-found-text">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="not-found-link">
        Go to Home
      </Link>
    </div>
  );
}

export default NotFound;
