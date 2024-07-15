import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Sign Out Error", error);
      });
  };

  return (
    <div className="home">
      <button className="logout-button" onClick={handleSignOut}>
        Logout
      </button>
      <h1>Welcome to Fitty!</h1>
      <nav>
        <Link to="/wardrobe">Go to Wardrobe</Link>
        <Link to="/shuffle">Shuffle Outfits</Link>
        <Link to="/favorites">View Favorites</Link>
      </nav>
    </div>
  );
}

export default Home;
