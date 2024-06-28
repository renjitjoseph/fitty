import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const favsRef = collection(db, "wardrobe", user.uid, "favorites");
      const snapshot = await getDocs(favsRef);
      const allFavs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(allFavs);
    };

    fetchFavorites();
  }, []);

  const deleteFavorite = async (id) => {
    const user = auth.currentUser;
    if (user) {
      await deleteDoc(doc(db, "wardrobe", user.uid, "favorites", id));
      setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/home")}>Back to Home</button>
      {favorites.map((fav, index) => (
        <div key={index}>
          <img src={fav.top} alt="top" />
          <img src={fav.bottom} alt="bottom" />
          <img src={fav.shoes} alt="shoes" />
          <img src={fav.accessories} alt="accessories" />
          <button onClick={() => deleteFavorite(fav.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Favorites;
