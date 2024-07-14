import React, { useState, useEffect } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }
      const favoritesRef = ref(
        storage,
        `wardrobe/${user.uid}/favorites/favorites.json`
      );
      try {
        const url = await getDownloadURL(favoritesRef);
        const response = await fetch(url);
        const favoritesData = await response.json();
        setFavorites(favoritesData);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
        alert("Failed to load favorites.");
      }
    };

    fetchFavorites();
  }, [navigate]);

  return (
    <div className="favorites-container">
      <button onClick={() => navigate("/home")}>Back to Home</button>
      <div className="favorites-grid">
        {favorites.map((favorite, index) => (
          <div key={index} className="favorite-outfit">
            {favorite.top && <img src={favorite.top} alt="top" />}
            {favorite.bottom && <img src={favorite.bottom} alt="bottom" />}
            {favorite.shoes && <img src={favorite.shoes} alt="shoes" />}
            {favorite.accessories && (
              <img src={favorite.accessories} alt="accessories" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
