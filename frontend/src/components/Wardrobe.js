import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ref,
  listAll,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { storage, db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import LoadingBar from "react-top-loading-bar";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { FiHome, FiTrash2 } from "react-icons/fi"; // Import icons
import "./Wardrobe.css";
import Modal from "../components/Modal"; // Ensure correct path to Modal

const categories = ["top", "bottom", "shoes", "accessories"];

function Wardrobe() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState({});
  const loadingBarRef = useRef(null);
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchItems = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const items = {};
        for (const cat of categories) {
          const categoryRef = ref(storage, `wardrobe/${user.uid}/${cat}`);
          const categoryList = await listAll(categoryRef);
          items[cat] = [];
          for (const itemRef of categoryList.items) {
            try {
              const url = await getDownloadURL(itemRef);
              items[cat].push({ id: itemRef.name, url, category: cat });
            } catch (itemError) {
              console.error(
                `Error fetching URL for item ${itemRef.name}:`,
                itemError
              );
            }
          }
        }
        setUploadedImages(items);
      } catch (error) {
        console.error("Error in fetchItems:", error);
      }
    } else {
      console.error("No user is signed in.");
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshKey]);

  const handleManualRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
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
            alert("Error uploading file: " + error.message);
            loadingBarRef.current.complete();
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const newItem = {
                id: uniqueFileName,
                url: downloadURL,
                category,
              };
              await addDoc(
                collection(db, "wardrobes", user.uid, "items"),
                newItem
              );
              setConfirmationMessage("File uploaded successfully!");
              setTimeout(() => setConfirmationMessage(""), 3000);
              setFile(null);
              setCategory("");
              setShowForm(false);
              loadingBarRef.current.complete();
              handleManualRefresh();
            } catch (error) {
              console.error("Error in upload completion:", error);
            }
          }
        );
      } else {
        console.error("No user is signed in.");
      }
    } catch (error) {
      alert("Failed to compress or upload file: " + error.message);
    }
  };

  const handleAddClothing = () => {
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
  };

  const handleDelete = async (id, url) => {
    const user = auth.currentUser;
    if (user) {
      const imageRef = ref(storage, url);
      try {
        await deleteObject(imageRef);
        await deleteDoc(doc(db, "wardrobes", user.uid, "items", id));
        setConfirmationMessage("File deleted successfully!");
        setTimeout(() => setConfirmationMessage(""), 3000);
        handleManualRefresh();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  return (
    <div className="wardrobe-page">
      <LoadingBar color="#f11946" ref={loadingBarRef} />
      <div className="header">
        <button className="back-button" onClick={() => navigate("/home")}>
          <FiHome size={24} />
        </button>
        <h2 className="wardrobe-title">My Wardrobe</h2>
      </div>
      <div className="wardrobe-content">
        {confirmationMessage && (
          <div className="confirmation-message">{confirmationMessage}</div>
        )}
        <button onClick={handleManualRefresh} className="wardrobe-button">
          Refresh Items
        </button>
        {categories.map((cat) => (
          <div key={cat}>
            <h3>{cat}</h3>
            <div className="wardrobe-carousel">
              {uploadedImages[cat] &&
                uploadedImages[cat].map((image, index) => (
                  <div key={index} className="wardrobe-item">
                    <LazyLoadImage
                      src={image.url}
                      alt={image.category}
                      effect="blur"
                      width="100%"
                    />
                    <div className="icon-category-container">
                      <p>{image.category}</p>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(image.id, image.url)}
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <button className="wardrobe-add-button" onClick={handleAddClothing}>
        +
      </button>
      {showForm && (
        <Modal show={showForm} onClose={handleCloseModal}>
          <form className="wardrobe-form" onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} />
            <select value={category} onChange={handleCategoryChange}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button type="submit" className="wardrobe-button">
              Upload
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Wardrobe;
