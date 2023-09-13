import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import "../index.css";
import "./App.css";

// Load environment variables
const googleLensApiKey = process.env.REACT_APP_GOOGLE_LENS_API_KEY;
const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;

const App = () => {
const [darkMode, setDarkMode] = useState(false);
const [imageUrl, setImageUrl] = useState("");
const [imageInfo, setImageInfo] = useState("");
const [recipe, setRecipe] = useState("");
const [isLoading, setIsLoading] = useState(false);

const toggleDarkMode = () => {
setDarkMode(!darkMode);
};

const handleImageUpload = async (event) => {
  setIsLoading(true);
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64data = reader.result;
    setImageUrl(base64data);

    try {
      const response = await fetch('/netlify/functions/getRecipe.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64data,
          googleLensApiKey,
          openaiApiKey,
        }),
      });

      const data = await response.json();
      const { description, recipe } = data;
      setImageInfo(description);
      setRecipe(recipe);
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  reader.readAsDataURL(file);
};

  return (
    <Router>
      <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              handleImageUpload={handleImageUpload}
              imageUrl={imageUrl}
              recipe={recipe}
              darkMode={darkMode}
              isLoading={isLoading}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;