import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authentication/AuthContext"; // Import AuthContext
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

    const handleLogoClick = () => {
        if (isLoggedIn) {
            navigate("/homepage"); // Navigate to the homepage if logged in
        } else {
            navigate("/"); // Navigate to the login page if not logged in
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
                <span className="navbar-logo">LoopLib</span>
            </div>
            <ul className="navbar-list">
                {isLoggedIn ? (
                    <>
                        <li className="navbar-item">
                            <Link to="/homepage" className="navbar-link">Home</Link>
                        </li>
                        <li className="navbar-item">
                            <Link to="/upload" className="navbar-link">Upload</Link>
                        </li>
                        <li className="navbar-item">
                            <Link to="/profile" className="navbar-link">Profile</Link>
                        </li>
                        <li className="navbar-item navbar-user">
                            <div className="user-info">
                                <div className="user-avatar">
                                    {user.firstName.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name">{user.firstName}</span>
                            </div>
                        </li>

                        <li className="navbar-item">
                            <FaSignOutAlt
                                className="navbar-logout-icon"
                                onClick={handleLogout} // Use handleLogout
                                title="Logout"
                            />
                        </li>
                    </>
                ) : (
                    <>
                        <li className="navbar-item">
                            <Link to="/" className="navbar-link">Login</Link>
                        </li>
                        <li className="navbar-item">
                            <Link to="/register" className="navbar-link">Register</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
