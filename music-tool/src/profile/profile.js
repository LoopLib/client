import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AWS from "aws-sdk";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAudioFiles, setShowAudioFiles] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
  });
  const [audioFiles, setAudioFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");

  const [operationInProgress, setOperationInProgress] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfileData(currentUser.uid);
        await fetchAudioFiles(currentUser.uid);
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

  const fetchAudioFiles = async (uid) => {
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      const params = { Bucket: "looplib-audio-bucket", Prefix: `users/${uid}/audio/` };
      const data = await s3.listObjectsV2(params).promise();

      const files = await Promise.all(
        data.Contents.map(async (file) => {
          const metadataKey = file.Key.replace("/audio/", "/metadata/") + ".metadata.json";

          let metadata = {};
          try {
            const metadataParams = { Bucket: params.Bucket, Key: metadataKey };
            const metadataObject = await s3.getObject(metadataParams).promise();
            metadata = metadataObject?.Body ? JSON.parse(metadataObject.Body.toString()) : {};
          } catch (error) {
            console.warn(`Metadata not found for ${file.Key}: ${error.message}`);
            metadata = { bpm: "Unknown", genre: "Unknown", musicalKey: "Unknown" }; // Default values
          }          

          return {
            name: file.Key.split("/").pop(),
            key: file.Key,
            url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${file.Key}`,
            bpm: metadata?.bpm || "Unknown",
            genre: metadata?.genre || "Unknown",
            musicalKey: metadata?.key || "Unknown",
          };
        })
      );

      setAudioFiles(files);
    } catch (error) {
      console.error("Error fetching audio files:", error.message);
    }
  };

  const handleEditFile = (file) => {
    setEditingFile(file);
    setNewFileName(file.name);
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;
  
    const oldKey = editingFile.key;
const newKey = oldKey.replace(editingFile.name, newFileName);
  
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });
  
      await s3.copyObject({
        Bucket: "looplib-audio-bucket",
        CopySource: `looplib-audio-bucket/${oldKey}`, // Full bucket path
        Key: newKey,
      }).promise();
  
      await s3.deleteObject({
        Bucket: "looplib-audio-bucket",
        Key: oldKey,
      }).promise();
  
      setAudioFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.key === oldKey ? { ...file, name: newFileName, key: newKey } : file
        )
      );
  
      setEditingFile(null);
      setNewFileName("");
      alert("File renamed successfully!");
    } catch (error) {
      console.error("Error renaming file:", error.message);
      alert("Failed to rename the file.");
    }
  };
  
  const handleDeleteFile = async (fileKey) => {
    setOperationInProgress(true);
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });
  
      await s3.deleteObject({
        Bucket: "looplib-audio-bucket",
        Key: fileKey,
      }).promise();
  
      setAudioFiles((prevFiles) => prevFiles.filter((file) => file.key !== fileKey));
      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error.message);
      alert("Failed to delete the file.");
    } finally {
      setOperationInProgress(false);
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
        sx={{ mt: 4 }}
        onClick={() => setShowAudioFiles(!showAudioFiles)}
        endIcon={showAudioFiles ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      >
        {showAudioFiles ? "Hide Audio Files" : "Show Audio Files"}
      </Button>

      {showAudioFiles && (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>BPM</TableCell>
                <TableCell>Genre</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audioFiles.map((file) => (
                <TableRow key={file.key}>
                  <TableCell>
                    {editingFile?.key === file.key ? (
                      <TextField
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        size="small"
                      />
                    ) : (
                      file.name
                    )}
                  </TableCell>
                  <TableCell>{file.bpm}</TableCell>
                  <TableCell>{file.genre}</TableCell>
                  <TableCell>{file.musicalKey}</TableCell>
                  <TableCell>
                    {editingFile?.key === file.key ? (
                      <Tooltip title="Save">
                        <IconButton onClick={handleSaveEdit}>
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditFile(file)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteFile(file.key)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Profile;
