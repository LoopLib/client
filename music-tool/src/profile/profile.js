import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  Button,
} from "@mui/material";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchAudioFiles(currentUser.uid);
      } else {
        setUser(null);
        setAudioFiles([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchAudioFiles = async (userId) => {
    const db = getFirestore();
    const audioQuery = query(collection(db, "audioFiles"), where("userId", "==", userId));
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
            {audioFiles.map((file) => (
              <Card key={file.id} className="audio-card" sx={{ mb: 2 }}>
                <Grid container alignItems="center">
                  <Grid item xs={8}>
                    <CardContent>
                      <Typography variant="h6">{file.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {file.description}
                      </Typography>
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
