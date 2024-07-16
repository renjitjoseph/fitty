import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import "./Favorites.css";

const categories = ["top", "bottom", "shoes", "accessories"];

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const favoritesCollection = collection(
        db,
        "users",
        user.uid,
        "favorites"
      );
      const favoriteSnapshot = await getDocs(favoritesCollection);
      const favoriteList = favoriteSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by dateSaved in descending order
      favoriteList.sort(
        (a, b) => b.dateSaved?.toDate() - a.dateSaved?.toDate()
      );

      setFavorites(favoriteList);
    };

    fetchFavorites();
  }, []);

  const deleteFavorite = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "favorites", id));
      setFavorites(favorites.filter((favorite) => favorite.id !== id));
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };

  return (
    <div className="favorites-container">
      <h1 className="favorites-title">Your Favorite Outfits</h1>
      <button onClick={() => navigate("/home")}>Back to Home</button>
      <div className="favorites-grid">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="favorite-item">
            <h2>{favorite.name}</h2>
            <p>
              Date Saved:{" "}
              {favorite.dateSaved
                ? favorite.dateSaved.toDate().toLocaleDateString()
                : "Unknown"}
            </p>
            {categories.map(
              (category) =>
                favorite[category] && (
                  <div key={category} className="favorite-category">
                    <img
                      src={favorite[category]?.url}
                      alt={category}
                      className="favorite-img"
                    />
                    <p>{category.toUpperCase()}</p>
                  </div>
                )
            )}
            <button
              className="trash-button"
              onClick={() => deleteFavorite(favorite.id)}
              title="Delete Favorite"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
