import React, { createContext, useState, useContext, useEffect } from "react";

// Create Auth Context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(() => {
        // Initialize state from localStorage if available
        const savedAuthState = localStorage.getItem("authState");
        return savedAuthState
            ? JSON.parse(savedAuthState)
            : { isLoggedIn: false, user: null };
    });

    // Save authState to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("authState", JSON.stringify(authState));
    }, [authState]);

    const login = (user) => setAuthState({ isLoggedIn: true, user });
    const logout = () => {
        setAuthState({ isLoggedIn: false, user: null });
        localStorage.removeItem("authState"); // Clear persistent state on logout
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using Auth Context
export const useAuth = () => useContext(AuthContext);
