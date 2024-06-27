import React from "react";
import { useNavigate } from "react-router-dom";

function Shuffle() {
  const navigate = useNavigate();
  return (
    <div>
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>
      <h2>Shuffle Page</h2>
      <p>
        This is the Shuffle page where users can shuffle their wardrobe items to
        find new outfit combinations.
      </p>
    </div>
  );
}

export default Shuffle;
