import React, { useState, useEffect } from "react";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { auth, storage } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const authSubscription = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login"); // Redirect to login if not authenticated
      } else {
        fetchFavorites(user.uid);
      }
    });

    return () => authSubscription(); // Cleanup subscription on unmount
  }, [navigate]);

  const fetchFavorites = async (userId) => {
    try {
      const favoritesRef = ref(
        storage,
        `wardrobe/${userId}/favorites/favorites.json`
      );
      const url = await getDownloadURL(favoritesRef);
      const response = await fetch(url);
      const favoritesData = await response.json();
      setFavorites(favoritesData);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      alert("Failed to fetch favorites.");
    }
  };

  const deleteFavorite = async (index) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const updatedFavorites = [...favorites];
      updatedFavorites.splice(index, 1);

      const blob = new Blob([JSON.stringify(updatedFavorites)], {
        type: "application/json",
      });
      const favoritesRef = ref(
        storage,
        `wardrobe/${user.uid}/favorites/favorites.json`
      );
      await uploadBytes(favoritesRef, blob);

      setFavorites(updatedFavorites);
      alert("Favorite deleted successfully!");
    } catch (error) {
      console.error("Error deleting favorite:", error);
      alert("Failed to delete favorite.");
    }
  };

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
            <button onClick={() => deleteFavorite(index)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
