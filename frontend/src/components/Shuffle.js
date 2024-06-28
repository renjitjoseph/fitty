import React, { useState } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Shuffle.module.css";

const categories = ["top", "bottom", "shoes", "accessories"];

function Shuffle() {
  const [outfitItems, setOutfitItems] = useState({});
  const [locks, setLocks] = useState({});
  const navigate = useNavigate();

  const fetchCategoryItems = async (category) => {
    const user = auth.currentUser;
    if (!user) return null; // Ensure the user is logged in

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
    for (let category of categories) {
      if (!locks[category]) {
        newItems[category] = await fetchCategoryItems(category);
      } else {
        newItems[category] = outfitItems[category]; // Keep the locked item
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

    try {
      const newItem = {
        top: outfitItems.top?.url,
        bottom: outfitItems.bottom?.url,
        shoes: outfitItems.shoes?.url,
        accessories: outfitItems.accessories?.url,
      };
      await addDoc(collection(db, "wardrobe", user.uid, "favorites"), newItem);
      alert("Outfit added to favorites!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add outfit to favorites.");
    }
  };

  const toggleLock = (category) => {
    setLocks((prevLocks) => ({
      ...prevLocks,
      [category]: !prevLocks[category],
    }));
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
                style={{ width: "100px", height: "100px" }}
              />
            ) : (
              "None"
            )}
          </p>
          <button onClick={() => toggleLock(category)}>
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
