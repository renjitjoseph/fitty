import React, { useState, useEffect } from "react";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { auth, storage, db } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
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

  const saveToFavorites = async () => {
    try {
      const docRef = await addDoc(
        collection(db, "users", auth.currentUser.uid, "favorites"),
        outfitItems
      );
      alert("Outfit saved to favorites with ID: " + docRef.id);
    } catch (error) {
      console.error("Error saving to favorites:", error);
      alert("Failed to save to favorites. Please try again.");
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
      <button onClick={saveToFavorites}>Save to Favorites</button>
    </div>
  );
}

export default Shuffle;
