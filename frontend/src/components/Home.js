import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Fitty!</h1>
      <div className="home-buttons">
        <button className="home-button">
          <Link to="/wardrobe">Go to Wardrobe</Link>
        </button>
        <button className="home-button">
          <Link to="/shuffle">Shuffle Outfits</Link>
        </button>
        <button className="home-button">
          <Link to="/favorites">View Favorites</Link>
        </button>
      </div>
    </div>
  );
}

export default Home;
