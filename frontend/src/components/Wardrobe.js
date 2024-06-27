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
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchItems = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      console.log("Fetching items for user ID:", user.uid);
      try {
        const items = [];
        for (const cat of categories) {
          console.log(`Fetching items for category: ${cat}`);
          const categoryRef = ref(storage, `wardrobe/${user.uid}/${cat}`);
          const categoryList = await listAll(categoryRef);
          console.log(`Found ${categoryList.items.length} items in ${cat}`);
          for (const itemRef of categoryList.items) {
            try {
              const url = await getDownloadURL(itemRef);
              items.push({ id: itemRef.name, url, category: cat });
              console.log(`Added item: ${itemRef.name} in ${cat}`);
            } catch (itemError) {
              console.error(
                `Error fetching URL for item ${itemRef.name}:`,
                itemError
              );
            }
          }
        }
        console.log("All items fetched. Total count:", items.length);
        setUploadedImages((prevImages) => {
          console.log("Previous images:", prevImages);
          console.log("New images:", items);
          return items;
        });
      } catch (error) {
        console.error("Error in fetchItems:", error);
      }
    } else {
      console.error("No user is signed in.");
    }
  }, []);

  useEffect(() => {
    console.log("Effect triggered with refreshKey:", refreshKey);
    fetchItems();
  }, [fetchItems, refreshKey]);

  const handleManualRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    setRefreshKey((prevKey) => {
      const newKey = prevKey + 1;
      console.log("Updating refresh key to:", newKey);
      return newKey;
    });
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("handleSubmit triggered");

    if (!file || !category) {
      console.log("File or category missing");
      alert("Please select a file and a category.");
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      console.log("Compressing file");
      const compressedFile = await imageCompression(file, options);
      const uniqueFileName = `${uuidv4()}-${compressedFile.name}`;
      console.log("Compressed file name:", uniqueFileName);

      const user = auth.currentUser;
      if (user) {
        console.log("User authenticated, starting upload");
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
            console.log("Upload progress:", progress);
            loadingBarRef.current.continuousStart(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            alert("Error uploading file: " + error.message);
            loadingBarRef.current.complete();
          },
          async () => {
            console.log("Upload completed, getting download URL");
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("Download URL obtained:", downloadURL);

              const newItem = {
                id: uniqueFileName,
                url: downloadURL,
                category,
              };
              console.log("Adding new item to Firestore:", newItem);

              await addDoc(
                collection(db, "wardrobes", user.uid, "items"),
                newItem
              );
              console.log("Item added to Firestore");
              setConfirmationMessage("File uploaded successfully!");
              setTimeout(() => setConfirmationMessage(""), 3000);
              setFile(null);
              setCategory("");
              setShowForm(false);
              loadingBarRef.current.complete();
              console.log("Upload complete. Triggering manual refresh.");
              handleManualRefresh();
              console.log("Manual refresh triggered after upload");
            } catch (error) {
              console.error("Error in upload completion:", error);
            }
          }
        );
      } else {
        console.error("No user is signed in.");
      }
    } catch (error) {
      console.error("Error during the upload process:", error);
      alert("Failed to compress or upload file: " + error.message);
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
        setConfirmationMessage("File deleted successfully!");
        setTimeout(() => setConfirmationMessage(""), 3000);
        console.log("Delete complete. Triggering manual refresh.");
        handleManualRefresh();
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
      {confirmationMessage && (
        <div className="confirmation-message">{confirmationMessage}</div>
      )}
      <button onClick={handleManualRefresh}>Refresh Items</button>
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="wardrobe-button"
            onClick={() => console.log("Upload button clicked")}
          >
            Upload
          </button>
        </form>
      )}
    </div>
  );
}

export default Wardrobe;
