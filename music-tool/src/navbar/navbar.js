import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Import AuthContext
import "./navbar.css";

function Navbar() {
    const { authState } = useAuth(); // Access global auth state
    const { isLoggedIn, user } = authState;

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
                {!isLoggedIn ? (
                    <>
                        <li className="navbar-item">
                            <Link to="/" className="navbar-link">Login</Link>
                        </li>
                        <li className="navbar-item">
                            <Link to="/register" className="navbar-link">Register</Link>
                        </li>
                    </>
                ) : (
                    <li className="navbar-item navbar-user">
                        Hello, {user.firstName}
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
