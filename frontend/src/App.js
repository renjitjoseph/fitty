import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Wardrobe from "./components/Wardrobe";
import Shuffle from "./components/Shuffle";
import Favorites from "./components/Favorites";
import LandingPage from "./components/LandingPage";
import { auth } from "./firebaseConfig";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/wardrobe"
          element={user ? <Wardrobe /> : <Navigate to="/" />}
        />
        <Route
          path="/shuffle"
          element={user ? <Shuffle /> : <Navigate to="/" />}
        />
        <Route
          path="/favorites"
          element={user ? <Favorites /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
