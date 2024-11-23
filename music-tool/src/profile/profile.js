import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import { auth } from "../firebaseConfig"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth"; // Listen for auth state changes
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Firebase Firestore
import "./profile.css"; // Import the shared styling


const Profile = () => {
    const [user, setUser] = useState(null); // State to store user info
    const [audioFiles, setAudioFiles] = useState([]); // State to store audio files
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchAudioFiles(currentUser.uid); // Fetch audio files for the user
            } else {
                setUser(null);
                setAudioFiles([]);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const fetchAudioFiles = async (userId) => {
        const db = getFirestore();
        const audioQuery = query(collection(db, "audioFiles"), where("userId", "==", userId)); // Query audio files
        const querySnapshot = await getDocs(audioQuery);

        const files = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAudioFiles(files);
    };

    if (loading) {
        return (
            <Box className="profile-container">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box className="profile-container">
            <Paper className="user-info">
                <Typography variant="h4" className="profile-title">
                    Profile
                </Typography>
                {user ? (
                    <>
                        <Typography variant="h6">Name: {user.displayName || "N/A"}</Typography>
                        <Typography variant="h6">Email: {user.email}</Typography>
                        <Typography variant="h6">UID: {user.uid}</Typography>
                    </>
                ) : (
                    <Typography variant="h6" color="error">
                        No user is logged in.
                    </Typography>
                )}
            </Paper>

            <Box className="audio-files">
                <Typography variant="h5" className="audio-files-title">
                    Audio Files
                </Typography>
                {audioFiles.length > 0 ? (
                    <List>
                        {audioFiles.map((file) => (
                            <ListItem key={file.id} className="audio-item">
                                <ListItemText primary={file.name} secondary={file.description} />
                                <audio controls>
                                    <source src={file.url} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body1" color="textSecondary">
                        No audio files uploaded yet.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default Profile;
