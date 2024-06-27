import React from "react";
import { Link } from "react-router-dom";
import SignOut from "./SignOut";

function Home() {
  return (
    <div className="home">
      <h1>Welcome to Fitty!</h1>
      <nav>
        <Link to="/wardrobe">Go to Wardrobe</Link>
        <Link to="/shuffle">Shuffle Outfits</Link>
        <Link to="/favorites">View Favorites</Link>
        <SignOut />
      </nav>
    </div>
  );
}

export default Home;
