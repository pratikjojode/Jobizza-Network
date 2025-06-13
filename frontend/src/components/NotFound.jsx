import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFound.css";
import Header from "./Header";
import Footer from "./Footer";
import notFoundImage from "../assets/Jobizza-logo.jpeg";
function NotFound() {
  return (
    <>
      <Header />
      <div className="not-found-container">
        <img
          src={notFoundImage}
          alt="Page not found"
          className="not-found-image"
        />
        <h1 className="not-found-heading">Oops! Page Not Found</h1>
        <p className="not-found-text">
          We can't find the page you're looking for. It might have been removed
          or you may have mistyped the URL.
        </p>
        <Link to="/" className="not-found-button">
          Back to Homepage
        </Link>
      </div>
      <Footer />
    </>
  );
}

export default NotFound;
