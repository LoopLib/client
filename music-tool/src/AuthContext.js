import React, { createContext, useState, useContext } from "react";

// Create Auth Context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isLoggedIn: false,
        user: null, // Store user info here
    });

    const login = (user) => setAuthState({ isLoggedIn: true, user });
    const logout = () => setAuthState({ isLoggedIn: false, user: null });

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using Auth Context
export const useAuth = () => useContext(AuthContext);
