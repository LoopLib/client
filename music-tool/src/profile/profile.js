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
import {
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import LoadingPage from "../loading/loading";
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

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [operationInProgress, setOperationInProgress] = useState(false);

  // For password change
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfileData(currentUser.uid);
        await fetchAudioFiles(currentUser.uid);
        fetchProfilePicture(currentUser.uid);
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

      const params = {
        Bucket: "looplib-audio-bucket",
        Prefix: `users/${uid}/audio/`,
      };
      const data = await s3.listObjectsV2(params).promise();

      const files = await Promise.all(
        data.Contents.map(async (file) => {
          const metadataKey =
            file.Key.replace("/audio/", "/metadata/") + ".metadata.json";

          let metadata = {};
          try {
            const metadataParams = {
              Bucket: params.Bucket,
              Key: metadataKey,
            };
            const metadataObject = await s3.getObject(metadataParams).promise();
            metadata = metadataObject?.Body
              ? JSON.parse(metadataObject.Body.toString())
              : {};
          } catch (error) {
            console.warn(
              `Metadata not found for ${file.Key}: ${error.message}`
            );
            metadata = {
              bpm: "Unknown",
              genre: "Unknown",
              musicalKey: "Unknown",
            };
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

  const fetchProfilePicture = async (uid) => {
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      const avatarKey = `users/${uid}/avatar/profile-picture.jpg`;
      const params = { Bucket: "looplib-audio-bucket", Key: avatarKey };
      const avatarUrl = s3.getSignedUrl("getObject", params);
      setProfilePictureUrl(avatarUrl);
    } catch (error) {
      console.warn("Error fetching profile picture:", error.message);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected.");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please select a .jpg or .png file.");
      return;
    }

    // Validate file size (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      alert("File size exceeds 5MB. Please select a smaller file.");
      return;
    }

    setSelectedImage(URL.createObjectURL(file));
  };

  const handleProfilePictureUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    if (!file) return;

    const fileName = "profile-picture.jpg";
    const avatarKey = `users/${user.uid}/avatar/${fileName}`;

    setUploading(true);

    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      await s3
        .putObject({
          Bucket: "looplib-audio-bucket",
          Key: avatarKey,
          Body: file,
          ContentType: file.type,
        })
        .promise();

      fetchProfilePicture(user.uid);
      alert("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error.message);
      alert(`Failed to upload profile picture: ${error.message}`);
    } finally {
      setUploading(false);
      setSelectedImage(null);
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

      // Copy to new key
      await s3
        .copyObject({
          Bucket: "looplib-audio-bucket",
          CopySource: `looplib-audio-bucket/${oldKey}`,
          Key: newKey,
        })
        .promise();

      // Delete old key
      await s3
        .deleteObject({
          Bucket: "looplib-audio-bucket",
          Key: oldKey,
        })
        .promise();

      setAudioFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.key === oldKey
            ? { ...file, name: newFileName, key: newKey }
            : file
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

      await s3
        .deleteObject({
          Bucket: "looplib-audio-bucket",
          Key: fileKey,
        })
        .promise();

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

        // Update Firebase displayName / email
        if (profileData.displayName !== user.displayName) {
          await updateProfile(user, { displayName: profileData.displayName });
        }
        if (profileData.email !== user.email) {
          await updateEmail(user, profileData.email);
        }

        setUser({ ...user, ...profileData });
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error saving profile data:", error.message);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      if (!newPassword || !confirmNewPassword) {
        alert("Please fill out both password fields.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert("Passwords do not match.");
        return;
      }
      if (newPassword.length < 6) {
        alert("Password should be at least 6 characters long.");
        return;
      }

      await updatePassword(user, newPassword);
      alert("Password updated successfully!");

      // Clear fields
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordFields(false);
    } catch (error) {
      console.error("Error updating password:", error.message);
      alert("Failed to update password: " + error.message);
    }
  };

  if (loading) {
    return <LoadingPage />;
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
        sx={{ textAlign: "center" }}
      >
        P R O F I L E
      </Typography>

      {/* Avatar / Image Upload */}
      <Box className="upload-image-container">
        <Box className="avatar-wrapper">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <AccountCircleIcon className="default-avatar-icon" />
          )}
          <Box className="change-icon-overlay">Change</Box>
        </Box>

        {selectedImage && (
          <Box className="image-preview-container">
            <img src={selectedImage} alt="Preview" className="image-preview" />
          </Box>
        )}

        <Box className="upload-buttons">
          <Button
            variant="outlined"
            component="label"
            className="select-image-button"
          >
            {selectedImage ? "Change Image" : "Select Image"}
            <input type="file" hidden onChange={handleImageChange} />
          </Button>

          {selectedImage && (
            <Button
              variant="contained"
              color="primary"
              className="upload-picture-button"
              onClick={handleProfilePictureUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Picture"}
            </Button>
          )}
        </Box>
      </Box>

      {/* User Info Section */}
      <Card className="user-info">
        <CardContent>
          <Typography variant="h5" className="user-info-title" gutterBottom>
            Profile Overview
          </Typography>

          {user ? (
            <Box className="user-info-details">
              {/* NAME */}
              <Box className="user-info-row">
                {editMode ? (
                  <TextField
                    label="Name"
                    type="text"
                    variant="outlined"
                    size="small"
                    className="custom-text-field"
                    value={profileData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    fullWidth
                  />
                ) : (
                  <>
                    <Typography variant="subtitle1" className="user-info-label">
                      Name:
                    </Typography>
                    <Typography variant="body1" className="user-info-value">
                      {profileData.displayName || "N/A"}
                    </Typography>
                  </>
                )}
              </Box>

              {/* EMAIL */}
              <Box className="user-info-row">
                {editMode ? (
                  <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    size="small"
                    className="custom-text-field"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    fullWidth
                  />
                ) : (
                  <>
                    <Typography variant="subtitle1" className="user-info-label">
                      Email:
                    </Typography>
                    <Typography variant="body1" className="user-info-value">
                      {profileData.email}
                    </Typography>
                  </>
                )}
              </Box>

              {/* UID */}
              <Box className="user-info-row">
                <Typography variant="subtitle1" className="user-info-label">
                  UID:
                </Typography>
                <Typography variant="body1" className="user-info-value">
                  {user.uid}
                </Typography>
              </Box>

              {/* SAVE / EDIT BUTTON */}
              <Box mt={2} sx={{ textAlign: "center" }}>
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
                  <IconButton color="primary" onClick={() => setEditMode(true)}>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>

              {/* CHANGE PASSWORD SECTION */}
              <Box mt={3} sx={{ textAlign: "center" }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  Change Password
                </Button>
                {showPasswordFields && (
                  <Box mt={2} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                      label="New Password"
                      type="password"
                      size="small"
                      className="custom-text-field"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Confirm Password"
                      type="password"
                      size="small"
                      className="custom-text-field"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePasswordUpdate}
                    >
                      Update Password
                    </Button>
                  </Box>
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

      {/* Show/Hide Audio Files Button */}
      <Button
        variant="contained"
        sx={{ mt: 4 }}
        onClick={() => setShowAudioFiles(!showAudioFiles)}
        endIcon={showAudioFiles ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      >
        {showAudioFiles ? "Hide Audio Files" : "Show Audio Files"}
      </Button>

      {/* Audio Files Table */}
      {showAudioFiles && (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>FILE NAME</TableCell>
                <TableCell>BPM</TableCell>
                <TableCell>GENRE</TableCell>
                <TableCell>KEY</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audioFiles.map((file) => (
                <TableRow key={file.key}>
                  <TableCell>
                    {editingFile?.key === file.key ? (
                      <TextField
                        label="New File Name"
                        variant="outlined"
                        size="small"
                        className="custom-text-field"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        fullWidth
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
