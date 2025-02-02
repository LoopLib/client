import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FileUpload from "./upload/upload";
import HomePage from "./home/homepage";
import Login from "./authentication/login";
import Register from "./authentication/register";
import Layout from "./structure/layout/layout";
import Profile from "./profile/profile";
import { AuthProvider, useAuth } from "./authentication/AuthContext";
import Edit from "./edit/edit";
import UserLibrary from "./user-library/user-library";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { authState } = useAuth();
    return authState.isLoggedIn ? children : <Navigate to="/" />;
};

// Redirect If Logged In Component
const RedirectIfLoggedIn = ({ children }) => {
    const { authState } = useAuth();
    return authState.isLoggedIn ? <Navigate to="/homepage" /> : children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        {/* Redirect to homepage if user is logged in */}
                        <Route
                            path="/"
                            element={
                                <RedirectIfLoggedIn>
                                    <Login />
                                </RedirectIfLoggedIn>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <RedirectIfLoggedIn>
                                    <Register />
                                </RedirectIfLoggedIn>
                            }
                        />
                        {/* Protected Routes for Logged-in Users */}
                        <Route
                            path="/homepage"
                            element={
                                <ProtectedRoute>
                                    <HomePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/upload"
                            element={
                                <ProtectedRoute>
                                    <FileUpload />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/edit"
                            element={
                                <ProtectedRoute>
                                    <Edit />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                           <Route
                            path="/user-library/:userUid"
                            element={
                                <ProtectedRoute>
                                    <UserLibrary />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;
