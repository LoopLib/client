import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  List,
  Grid,
  IconButton,
  Button,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AWS from "aws-sdk"; // AWS SDK for accessing S3
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfileData(currentUser.uid); // Fetch profile details
        await fetchAudioFilesFromAWS(currentUser.uid); // Fetch audio files from AWS
      } else {
        setUser(null);
        setAudioFiles([]);
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

  const fetchAudioFilesFromAWS = async (userId) => {
    try {

      });

      const params = {
        Bucket: "looplib-audio-bucket",
        Prefix: `users/${userId}/`, // Path to user's files in S3
      };

      const data = await s3.listObjectsV2(params).promise();
      const files = data.Contents.map((file) => ({
        name: file.Key.split("/").pop(), // Extract file name
        url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${file.Key}`,
      }));

      setAudioFiles(files);
    } catch (error) {
      console.error("Error fetching audio files from AWS:", error.message);
    }
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
      <Box className="profile-header" mb={4}>
        <AccountCircleIcon sx={{ fontSize: 80, color: "#3f51b5" }} />
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
          <Typography variant="h6" gutterBottom>
            User Details
          </Typography>
          {user ? (
            <>
              <Typography variant="body1">Name: {user.displayName || "N/A"}</Typography>
              <Typography variant="body1">Email: {user.email}</Typography>
              <Typography variant="body1">UID: {user.uid}</Typography>
            </>
          ) : (
            <Typography variant="body1" color="error">
              No user is logged in.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box className="audio-files" mt={4}>
        <Typography variant="h5" className="audio-files-title" mb={2}>
          Your Audio Files
        </Typography>
        {audioFiles.length > 0 ? (
          <List>
            {audioFiles.map((file, index) => (
              <Card key={index} className="audio-card" sx={{ mb: 2 }}>
                <Grid container alignItems="center">
                  <Grid item xs={8}>
                    <CardContent>
                      <Typography variant="h6">{file.name}</Typography>
                    </CardContent>
                  </Grid>
                  <Grid item xs={3}>
                    <audio controls style={{ width: "100%" }}>
                      <source src={file.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
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
