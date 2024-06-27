import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

// Define categories outside of the component to ensure they are constant
const categories = ["top", "bottom", "shoes", "accessories"];

function Shuffle() {
  const [outfit, setOutfit] = useState({});
  const [locked, setLocked] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Memoizing fetchItems using useCallback with proper dependencies
  const fetchItems = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    let newOutfit = { ...outfit };
    let shouldUpdate = false;

    for (const category of categories) {
      if (!locked[category]) {
        const q = query(
          collection(db, "wardrobe"),
          where("category", "==", category)
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const selectedItem = items[Math.floor(Math.random() * items.length)];
        if (
          !newOutfit[category] ||
          newOutfit[category].id !== selectedItem.id
        ) {
          newOutfit[category] = selectedItem;
          shouldUpdate = true;
        }
      }
    }

    if (shouldUpdate) {
      setOutfit(newOutfit);
    }
    setIsLoading(false);
  }, [outfit, locked, isLoading]);

  // Use effect for initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleLock = (category) => {
    setLocked((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleFavorite = async () => {
    if (!isLoading) {
      await addDoc(collection(db, "favorites"), outfit);
    }
  };

  return (
    <div>
      <h2>Shuffle Outfits</h2>
      {categories.map((category) => (
        <div key={category}>
          <h3>{category}</h3>
          <p>{outfit[category]?.name || "No item selected"}</p>
          <button onClick={() => toggleLock(category)}>
            {locked[category] ? "Unlock" : "Lock"}
          </button>
        </div>
      ))}
      <button onClick={fetchItems} disabled={isLoading}>
        Shuffle
      </button>
      <button onClick={handleFavorite} disabled={isLoading}>
        ♥ Add to Favorites
      </button>
    </div>
  );
}

export default Shuffle;
