import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ref,
  listAll,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { storage, db, auth } from "../firebaseConfig";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import LoadingBar from "react-top-loading-bar";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "./Wardrobe.css";

const categories = ["top", "bottom", "shoes", "accessories"];

function Wardrobe() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const loadingBarRef = useRef(null);
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      console.log("Fetching items for user ID:", user.uid);
      const items = [];
      for (const cat of categories) {
        const categoryRef = ref(storage, `wardrobe/${user.uid}/${cat}`);
        const categoryList = await listAll(categoryRef);
        for (const itemRef of categoryList.items) {
          const url = await getDownloadURL(itemRef);
          items.push({ id: itemRef.name, url, category: cat });
        }
      }
      setUploadedImages(items);
      console.log("Fetched items:", items);
    } else {
      console.error("No user is signed in.");
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleRefresh = () => {
    console.log("Refreshing items...");
    fetchItems();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !category) {
      alert("Please select a file and a category.");
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const uniqueFileName = `${uuidv4()}-${compressedFile.name}`;
      const user = auth.currentUser;
      if (user) {
        const storageRef = ref(
          storage,
          `wardrobe/${user.uid}/${category}/${uniqueFileName}`
        );
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            loadingBarRef.current.continuousStart(progress);
          },
          (error) => {
            alert("Error uploading file");
            console.error("Upload error:", error);
            loadingBarRef.current.complete();
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const newItem = {
              id: uniqueFileName, // Using the file name as an ID for uniqueness
              url: downloadURL,
              category,
            };
            await addDoc(collection(db, "wardrobes", user.uid, "items"), {
              url: downloadURL,
              category,
            });
            // Update state immediately with the new image
            setUploadedImages((prevImages) => [...prevImages, newItem]);
            setConfirmationMessage("File uploaded successfully!");
            setTimeout(() => setConfirmationMessage(""), 3000);
            setFile(null);
            setCategory("");
            setShowForm(false);
            loadingBarRef.current.complete();

            console.log("Upload complete. New item added to the view.");
          }
        );
      } else {
        console.error("No user is signed in.");
      }
    } catch (error) {
      console.error("Error compressing file:", error);
    }
  };

  const handleAddClothing = () => {
    setShowForm(!showForm);
  };

  const handleDelete = async (id, url) => {
    const user = auth.currentUser;
    if (user) {
      const imageRef = ref(storage, url);
      try {
        await deleteObject(imageRef);
        await deleteDoc(doc(db, "wardrobes", user.uid, "items", id));
        setUploadedImages(uploadedImages.filter((image) => image.id !== id));
        setConfirmationMessage("File deleted successfully!");
        setTimeout(() => setConfirmationMessage(""), 3000);

        console.log("Delete complete. Fetching items again.");

        // Re-fetch items
        await fetchItems();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  return (
    <div className="wardrobe-page">
      <LoadingBar color="#f11946" ref={loadingBarRef} />
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>
      <h2 className="wardrobe-title">My Wardrobe</h2>
      <button className="refresh-button" onClick={handleRefresh}>
        Refresh
      </button>
      {confirmationMessage && (
        <div className="confirmation-message">{confirmationMessage}</div>
      )}
      <div className="wardrobe-gallery">
        {uploadedImages.map((image, index) => (
          <div key={index} className="wardrobe-item">
            <LazyLoadImage
              src={image.url}
              alt={image.category}
              effect="blur"
              width="100%"
            />
            <p>{image.category}</p>
            <button
              className="delete-button"
              onClick={() => handleDelete(image.id, image.url)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <button className="wardrobe-add-button" onClick={handleAddClothing}>
        {showForm ? "-" : "+"}
      </button>
      {showForm && (
        <form className="wardrobe-form" onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <select value={category} onChange={handleCategoryChange}>
            <option value="">Select Category</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="shoes">Shoes</option>
            <option value="accessories">Accessories</option>
          </select>
          <button type="submit" className="wardrobe-button">
            Upload
          </button>
        </form>
      )}
    </div>
  );
}

export default Wardrobe;
