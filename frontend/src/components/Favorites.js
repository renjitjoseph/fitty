import React from "react";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const navigate = useNavigate();
  return (
    <div>
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>
      <h2>Favorites Page</h2>
      <p>
        This is the Favorites page where users can view all their saved favorite
        outfits.
      </p>
    </div>
  );
}

export default Favorites;
