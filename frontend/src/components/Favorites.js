import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./Favorites.css"; // Make sure this CSS file exists and is correctly loaded

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
        </div>
      ))}
    </div>
  );
};

export default Favorites;
