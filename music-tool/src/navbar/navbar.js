import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">LoopLib</Link>
      </div>
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/homepage" className="navbar-link">Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/upload" className="navbar-link">Upload</Link>
        </li>
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Login</Link>
        </li>
        <li className="navbar-item">
          <Link to="/register" className="navbar-link">Register</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
