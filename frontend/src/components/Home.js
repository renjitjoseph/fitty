import React from "react";
import { Link } from "react-router-dom";

function Home({ isAuthenticated }) {
  return (
    <div>
      <h2>Home Page</h2>
      <p>Welcome to Fitty App!</p>
      {isAuthenticated ? (
        <>
          <button>
            <Link to="/wardrobe">Go to Wardrobe</Link>
          </button>
          <button>
            <Link to="/shuffle">Shuffle Outfits</Link>
          </button>
          <button>
            <Link to="/favorites">View Favorites</Link>
          </button>
        </>
      ) : (
        <>
          <button>
            <Link to="/login">Login</Link>
          </button>
          <button>
            <Link to="/register">Register</Link>
          </button>
        </>
      )}
    </div>
  );
}

export default Home;
