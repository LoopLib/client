import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Button, List } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Library from "../library/library";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAudioFiles, setShowAudioFiles] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfileData(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchProfileData = async (userId) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("User profile data:", userDoc.data());
      } else {
        console.error("No user profile found!");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error.message);
    }
  };

  return (
    <Box
      className="all-audio-container"
      sx={{
        width: "80%",
        maxWidth: "none",
        margin: "20px auto",
      }}
    >
      <Typography
        variant="h4"
        className="all-audio-title"
        mb={4}
        fontFamily={"Montserrat, sans-serif"}
        fontWeight="bold"
      >
        P R O F I L E
      </Typography>

      <Box className="profile-header" mb={4}>
        <AccountCircleIcon sx={{ fontSize: 80, color: "##FFFFFF" }} />
        <Typography variant="h4" className="profile-title" mt={2}>
          {user ? user.displayName || "Welcome, User!" : "No User Logged In"}
        </Typography>
        {user && (
          <Typography variant="subtitle1" color="textSecondary">
            {user.email}
          </Typography>
        )}
      </Box>

      <Card className="user-info">
        <CardContent>
          <Typography variant="h5" className="user-info-title" gutterBottom>
            Profile Overview
          </Typography>
          {user ? (
            <Box className="user-info-details">
              <Box className="user-info-row">
                <Typography variant="subtitle1" className="user-info-label">
                  Name:
                </Typography>
                <Typography variant="body1" className="user-info-value">
                  {user.displayName || "N/A"}
                </Typography>
              </Box>
              <Box className="user-info-row">
                <Typography variant="subtitle1" className="user-info-label">
                  Email:
                </Typography>
                <Typography variant="body1" className="user-info-value">
                  {user.email}
                </Typography>
              </Box>
              <Box className="user-info-row">
                <Typography variant="subtitle1" className="user-info-label">
                  UID:
                </Typography>
                <Typography variant="body1" className="user-info-value">
                  {user.uid}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box className="no-user-info">
              <Typography variant="body1" color="error">
                No user is logged in.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        sx={{
          marginTop: "20px",
          fontWeight: "bold",
          background: "#6a11cb",
          maxWidth: "200px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        }}
        endIcon={showAudioFiles ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setShowAudioFiles(!showAudioFiles)}
      >
        {showAudioFiles ? "Hide Audio Files" : "Show Audio Files"}
      </Button>
      {showAudioFiles && user && (
        <Box className="audio-files" mt={4}>
          <Library ownerUid={user?.uid} />
        </Box>
      )}
    </Box>
  );
};

export default Profile;
