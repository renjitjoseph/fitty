import React from "react";
import { Link } from "react-router-dom";
import "./AuthLanding.css";
import fittyLogo from "../fittylogo.png"; // Corrected path

function LandingPage() {
  return (
    <div className="container">
      <img src={fittyLogo} alt="Fitty Logo" className="hero-image" />
      <h1>Welcome to Fitty</h1>
      <p>
        Your ultimate fashion companion. Organize your wardrobe, shuffle your
        outfits, and find your style.
      </p>
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
      <div className="footer">
        <p>&copy; 2024 Fitty. All rights reserved.</p>
      </div>
    </div>
  );
}

export default LandingPage;
