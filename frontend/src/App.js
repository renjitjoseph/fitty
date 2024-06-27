import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Wardrobe from "./components/Wardrobe";
import Shuffle from "./components/Shuffle";
import Favorites from "./components/Favorites";
import LandingPage from "./components/LandingPage"; // Import the LandingPage component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/shuffle" element={<Shuffle />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </Router>
  );
}

export default App;
