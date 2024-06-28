import React, { useState, useEffect } from "react";
import { auth, storage } from "../firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login"); // Redirect to login if not authenticated
        return;
      }

      try {
        const favoritesRef = ref(
          storage,
          `wardrobe/${user.uid}/favorites/favorites.json`
        );
        const url = await getDownloadURL(favoritesRef);
        const response = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        setFavoriteOutfits(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [navigate]);

  return (
    <div>
      <h1>My Favorite Outfits</h1>
      <button onClick={() => navigate("/home")}>Back to Home</button>
      <div>
        {favoriteOutfits.map((outfit, index) => (
          <div
            key={index}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            <p>
              Top:{" "}
              {outfit.top && (
                <img
                  src={outfit.top}
                  alt="Top"
                  style={{ width: "100px", height: "100px" }}
                />
              )}
            </p>
            <p>
              Bottom:{" "}
              {outfit.bottom && (
                <img
                  src={outfit.bottom}
                  alt="Bottom"
                  style={{ width: "100px", height: "100px" }}
                />
              )}
            </p>
            <p>
              Shoes:{" "}
              {outfit.shoes && (
                <img
                  src={outfit.shoes}
                  alt="Shoes"
                  style={{ width: "100px", height: "100px" }}
                />
              )}
            </p>
            <p>
              Accessories:{" "}
              {outfit.accessories && (
                <img
                  src={outfit.accessories}
                  alt="Accessories"
                  style={{ width: "100px", height: "100px" }}
                />
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
