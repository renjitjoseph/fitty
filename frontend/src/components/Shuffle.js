import React, { useState, useEffect } from "react";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { auth, storage, db } from "../firebase/firebaseConfig";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import "./Shuffle.css";
import { FaHeart } from "react-icons/fa";

const categories = ["top", "bottom", "shoes", "accessories"];

function Shuffle() {
  const [outfitItems, setOutfitItems] = useState({});
  const [locks, setLocks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    const fetchFavoriteCount = async () => {
      const user = auth.currentUser;
      if (user) {
        const favoritesCollection = collection(
          db,
          "users",
          user.uid,
          "favorites"
        );
        const favoriteSnapshot = await getDocs(favoritesCollection);
        setFavoriteCount(favoriteSnapshot.size);
      }
    };

    fetchFavoriteCount();
  }, []);

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
        newItems[category] = outfitItems[category];
      }
    }
    setOutfitItems(newItems);
  };

  const saveToFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const name = favoriteName || `Fit ${favoriteCount + 1}`;

      const docRef = await addDoc(
        collection(db, "users", user.uid, "favorites"),
        {
          ...outfitItems,
          name,
          dateSaved: Timestamp.now(),
        }
      );
      setModalMessage(`Outfit saved as "${name}" with ID: ${docRef.id}`);
      setShowModal(true);
      setFavoriteName(""); // Clear the input after saving
      setShowNameModal(false); // Close the name input modal
      setFavoriteCount(favoriteCount + 1); // Increment the favorite count
    } catch (error) {
      console.error("Error saving to favorites:", error);
      setModalMessage("Failed to save to favorites. Please try again.");
      setShowModal(true);
    }
  };

  const handleSaveClick = () => {
    setShowNameModal(true);
  };

  return (
    <div className="shuffle-container">
      <h1 className="shuffle-title">Shuffle and Lock Items</h1>
      <button onClick={() => navigate("/home")}>Back to Home</button>
      {categories.map((category) => (
        <div key={category} className="shuffle-item">
          <p>
            {category.toUpperCase()}:{" "}
            {outfitItems[category] ? (
              <img
                src={outfitItems[category]?.url}
                alt={category}
                className="shuffle-img"
              />
            ) : (
              "None"
            )}
          </p>
          <button
            className="lock-button"
            onClick={() =>
              setLocks((prev) => ({ ...prev, [category]: !prev[category] }))
            }
          >
            {locks[category] ? "Unlock" : "Lock"}
          </button>
        </div>
      ))}
      <div className="button-container">
        <button className="shuffle-button" onClick={shuffleOutfits}>
          Shuffle
        </button>
        <button
          className="heart-button"
          onClick={handleSaveClick}
          title="Save to Favorites"
        >
          <FaHeart />
        </button>
      </div>

      <Modal show={showNameModal} onClose={() => setShowNameModal(false)}>
        <h2>Enter Favorite Name</h2>
        <input
          type="text"
          value={favoriteName}
          onChange={(e) => setFavoriteName(e.target.value)}
          placeholder="Favorite name"
          className="favorite-name-input"
        />
        <button onClick={saveToFavorites}>Save</button>
      </Modal>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        {modalMessage}
      </Modal>
    </div>
  );
}

export default Shuffle;
