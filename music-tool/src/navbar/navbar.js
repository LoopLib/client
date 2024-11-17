import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css"; // Create a CSS file for styling

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/homepage">Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/upload">Upload</Link>
        </li>
        <li className="navbar-item">
          <Link to="/">Login</Link>
        </li>
        <li className="navbar-item">
          <Link to="/register">Register</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
