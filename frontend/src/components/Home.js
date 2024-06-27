import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>Welcome to Fitty!</h2>
      <div>
        <button>
          <Link to="/wardrobe">Go to Wardrobe</Link>
        </button>
        <button>
          <Link to="/shuffle">Shuffle Outfits</Link>
        </button>
        <button>
          <Link to="/favorites">View Favorites</Link>
        </button>
      </div>
    </div>
  );
}

export default Home;
