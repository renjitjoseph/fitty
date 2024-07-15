import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

export const addFavorite = async (userId, outfit) => {
  const docRef = await addDoc(
    collection(db, "users", userId, "favorites"),
    outfit
  );
  console.log("Favorite saved with ID:", docRef.id);
};

export const fetchFavorites = async (userId) => {
  const querySnapshot = await getDocs(
    collection(db, "users", userId, "favorites")
  );
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const saveOutfit = async (userId, outfit) => {
  const docRef = await addDoc(
    collection(db, "users", userId, "wardrobe"),
    outfit
  );
  console.log("Outfit saved with ID:", docRef.id);
};

export const fetchWardrobe = async (userId) => {
  const querySnapshot = await getDocs(
    collection(db, "users", userId, "wardrobe")
  );
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
