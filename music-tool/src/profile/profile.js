import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import Library from "../library/library";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAudioFiles, setShowAudioFiles] = useState(false); // Reintroduced state
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
  });

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
        setProfileData(userDoc.data());
      } else {
        console.error("No user profile found!");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProfileData = async () => {
    try {
      if (user) {
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, profileData, { merge: true });

        // Update Firebase Authentication (Optional: Update displayName or email)
        if (profileData.displayName !== user.displayName) {
          await updateProfile(user, { displayName: profileData.displayName });
        }
        if (profileData.email !== user.email) {
          await updateEmail(user, profileData.email);
        }

        // Reflect changes in the local state
        setUser({ ...user, ...profileData });
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error saving profile data:", error.message);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

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
                {editMode ? (
                  <TextField
                    variant="outlined"
                    value={profileData.displayName}
                    onChange={(e) =>
                      handleInputChange("displayName", e.target.value)
                    }
                    size="small"
                  />
                ) : (
                  <Typography variant="body1" className="user-info-value">
                    {profileData.displayName || "N/A"}
                  </Typography>
                )}
              </Box>
              <Box className="user-info-row">
                <Typography variant="subtitle1" className="user-info-label">
                  Email:
                </Typography>
                {editMode ? (
                  <TextField
                    variant="outlined"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1" className="user-info-value">
                    {profileData.email}
                  </Typography>
                )}
              </Box>
              <Box className="user-info-row">
                <Typography variant="subtitle1" className="user-info-label">
                  UID:
                </Typography>
                <Typography variant="body1" className="user-info-value">
                  {user.uid}
                </Typography>
              </Box>
              <Box mt={2}>
                {editMode ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={saveProfileData}
                  >
                    Save
                  </Button>
                ) : (
                  <IconButton
                    color="primary"
                    onClick={() => setEditMode(true)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
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
