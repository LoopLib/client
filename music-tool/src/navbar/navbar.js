import React from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../AuthContext"; // Import AuthContext
import "./navbar.css";
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon

function Navbar() {
    const { authState, logout } = useAuth(); // Access global auth state and logout function
    const { isLoggedIn, user } = authState;
    const navigate = useNavigate(); // Initialize navigate

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        navigate("/"); // Navigate to '/' after logout
    };

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
                    <Link to="/profile" className="navbar-link">Profile</Link>
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
                    <>
                        <li className="navbar-item navbar-user">
                            Hello, {user.firstName}
                        </li>
                        <li className="navbar-item">
                            <FaSignOutAlt 
                                className="navbar-logout-icon" 
                                onClick={handleLogout} // Use handleLogout
                                title="Logout" 
                            />
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
