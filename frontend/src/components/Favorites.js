import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./Favorites.css";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (auth.currentUser) {
        const favsRef = collection(
          db,
          "users",
          auth.currentUser.uid,
          "favorites"
        );
        const snapshot = await getDocs(favsRef);
        const favs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(favs);
      } else {
        console.log("User not logged in");
        navigate("/login");
      }
    };

    fetchFavorites();
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const favDocRef = doc(db, "users", user.uid, "favorites", id);
        await deleteDoc(favDocRef);
        setFavorites(favorites.filter((fav) => fav.id !== id));
      } else {
        console.log("User not logged in");
      }
    } catch (error) {
      console.error("Error deleting favorite item:", error);
    }
  };

  return (
    <div className="favorites-container">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back to Home
      </button>
      {favorites.map((fav, index) => (
        <div key={index} className="favorite-item">
          <img src={fav.top.url} alt="Top" />
          <img src={fav.bottom.url} alt="Bottom" />
          <img src={fav.shoes.url} alt="Shoes" />
          <img src={fav.accessories.url} alt="Accessories" />
          <button
            className="delete-button"
            onClick={() => handleDelete(fav.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Favorites;
