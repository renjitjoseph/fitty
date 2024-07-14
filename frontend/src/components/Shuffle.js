import React, { useState, useEffect } from "react";
import { ref, getDownloadURL, uploadBytes, listAll } from "firebase/storage";
import { auth, storage } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Shuffle.css";

const categories = ["top", "bottom", "shoes", "accessories"];

function Shuffle() {
  const [outfitItems, setOutfitItems] = useState({});
  const [locks, setLocks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return unsubscribe; // Cleanup the subscription
  }, [navigate]);

  const fetchCategoryItems = async (category) => {
    const user = auth.currentUser;
    if (!user) return null;

    const itemsRef = ref(storage, `wardrobe/${user.uid}/${category}`);
    const snapshot = await listAll(itemsRef);
    const items = await Promise.all(
      snapshot.items.map((itemRef) =>
        getDownloadURL(itemRef).then((url) => ({ url, category }))
      )
    );
    return items.length > 0
      ? items[Math.floor(Math.random() * items.length)]
      : null;
  };

  const shuffleOutfits = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newItems = {};
    for (const category of categories) {
      if (!locks[category]) {
        newItems[category] = await fetchCategoryItems(category);
      } else {
        newItems[category] = outfitItems[category]; // Preserve locked items
      }
    }
    setOutfitItems(newItems);
  };

  const addToFavorites = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to add favorites.");
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
      const updatedFavorites = [...favoritesData, outfitItems];
      const blob = new Blob([JSON.stringify(updatedFavorites)], {
        type: "application/json",
      });
      await uploadBytes(favoritesRef, blob);
      alert("Outfit added to favorites!");
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        // If the file does not exist, create it with the outfit
        const initialFavorites = [outfitItems];
        const blob = new Blob([JSON.stringify(initialFavorites)], {
          type: "application/json",
        });
        await uploadBytes(favoritesRef, blob);
        alert("First outfit added to favorites!");
      } else {
        console.error("Error adding to favorites:", error);
        alert("Failed to add outfit to favorites.");
      }
    }
  };

  return (
    <div>
      <h1>Shuffle and Lock Items</h1>
      <button onClick={() => navigate("/home")}>Back to Home</button>
      {categories.map((category) => (
        <div key={category}>
          <p>
            {category.toUpperCase()}:{" "}
            {outfitItems[category] ? (
              <img
                src={outfitItems[category].url}
                alt={category}
                style={{ width: "100px" }}
              />
            ) : (
              "None"
            )}
          </p>
          <button
            onClick={() =>
              setLocks((prev) => ({ ...prev, [category]: !prev[category] }))
            }
          >
            {locks[category] ? "Unlock" : "Lock"}
          </button>
        </div>
      ))}
      <button onClick={shuffleOutfits}>Shuffle</button>
      <button onClick={addToFavorites}>Add to Favorites</button>
    </div>
  );
}

export default Shuffle;
