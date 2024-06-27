import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

function Favorites() {
  const categories = ["top", "bottom", "shoes", "accessories"]; // Define categories here
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const querySnapshot = await getDocs(collection(db, "favorites"));
      setFavorites(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    fetchFavorites();
  }, []);

  return (
    <div>
      <h2>Favorites</h2>
      {favorites.length > 0 ? (
        favorites.map((fav) => (
          <div
            key={fav.id}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            {categories.map((category) => (
              <p key={category}>{fav[category]?.name}</p>
            ))}
          </div>
        ))
      ) : (
        <p>No favorites yet.</p>
      )}
    </div>
  );
}

export default Favorites;
