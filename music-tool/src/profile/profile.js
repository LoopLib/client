import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Card, CardContent, CircularProgress, List, Button, IconButton } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AWS from "aws-sdk";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AudioCard from "../audiocard/audiocard";
import "./profile.css";


const Profile = () => {
  const [user, setUser] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const waveSurferRefs = useRef({}); // Store WaveSurfer instances for each track
  const [activeIndexes, setActiveIndexes] = useState([]); // Tracks currently playing files
  const [showAudioFiles, setShowAudioFiles] = useState(false); // Dropdown visibility

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfileData(currentUser.uid);
        await fetchAudioFilesFromAWS(currentUser.uid);
      } else {
        setUser(null);
        setAudioFiles([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      // Clean up WaveSurfer instances on unmount
      Object.values(waveSurferRefs.current).forEach((waveSurfer) => {
        waveSurfer.destroy();
      });
    };
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
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
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

  const handleDelete = async (file) => {
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      const params = {
        Bucket: process.env.REACT_APP_S3_BUCKET,
        Key: `users/${user.uid}/${file.name}`,
      };

      await s3.deleteObject(params).promise();
      setAudioFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
      console.log("File deleted successfully:", file.name);
    } catch (error) {
      console.error("Error deleting file:", error.message);
    }
  };

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    console.log("Right-click on file:", file.name);
  };

  return (
    <Box className="profile-container">
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

      <Box className="audio-files" mt={4}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            marginTop: "20px",
            fontWeight: "bold",
            background: "#6a11cb",
            maxWidth: "200px",
          }}
          endIcon={showAudioFiles ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowAudioFiles(!showAudioFiles)}
        >
          {showAudioFiles ? "Hide Audio Files" : "Show Audio Files"}
        </Button>
        {showAudioFiles && (
          <List>
            {audioFiles.length > 0 ? (
              audioFiles.map((file, index) => (
                <AudioCard
                  key={index}
                  file={file}
                  index={index}
                  activeIndexes={activeIndexes}
                  setActiveIndexes={setActiveIndexes}
                  waveSurferRefs={waveSurferRefs}
                  onContextMenu={(event) => handleContextMenu(event, file)}
                />
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No audio files uploaded yet.
              </Typography>
            )}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
