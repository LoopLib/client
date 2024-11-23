// Profile.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { auth } from "../firebaseConfig"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth"; // Listen for auth state changes
import "./profile.css"; // Import the shared styling

const Profile = () => {
    const [user, setUser] = useState(null); // State to store user info
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <Box className="profile-container">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box className="profile-container">
            <Typography variant="h4" className="profile-title">
                Profile
            </Typography>
            {user ? (
                <Paper className="profile-paper">
                    <Typography variant="h6">Name: {user.displayName || "N/A"}</Typography>
                    <Typography variant="h6">Email: {user.email}</Typography>
                    <Typography variant="h6">UID: {user.uid}</Typography>
                </Paper>
            ) : (
                <Typography variant="h6" color="error">
                    No user is logged in.
                </Typography>
            )}
        </Box>
    );
};

export default Profile;
