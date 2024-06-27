import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <h1 className="landing-title">Fitty</h1>
      <div className="landing-buttons">
        <button className="landing-button">
          <Link to="/login">Login</Link>
        </button>
        <button className="landing-button">
          <Link to="/register">Register</Link>
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
