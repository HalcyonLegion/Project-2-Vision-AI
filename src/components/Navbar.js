import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../components/Navbar.css";

const Navbar = ({ darkMode, toggleDarkMode }) => {
  return (
    <nav
      className={`flex items-center justify-between p-6 border-b ${
        darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img id="logo" src={logo} alt="vlogo" className="mr-2" />
          <span className="font-bold text-xl">Vision AI</span>
        </Link>
      </div>

      <div>
        <Link to="/calorie-companion" className="mr-4 text-purple-500 hover:text-purple-700">
          Calorie Companion
        </Link>
        <Link to="/fashion-finder" className="text-purple-500 hover:text-purple-700">
          Fashion Finder
        </Link>
        <button
          onClick={toggleDarkMode}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700 ml-4"
        >
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
