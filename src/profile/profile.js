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
  Chip,
  CardActions,
  Stack
} from "@mui/material";
import { Alert } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PianoIcon from "@mui/icons-material/Piano";
import { styled } from '@mui/material/styles';
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

const StyledTableRow = styled(TableRow)(({ theme, striped }) => ({
  backgroundColor: striped ? theme.palette.action.hover : "inherit",
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [showAudioFiles, setShowAudioFiles] = useState(false);
  const [profileData, setProfileData] = useState({ displayName: "", email: "" });
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

  const [errorMessage, setErrorMessage] = useState(""); // State for error messages

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

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(""); // Clear the error message after 5 seconds
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

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
          const metadataKey = file.Key.replace("/audio/", "/metadata/") + ".metadata.json";
          let metadata = {};
          try {
            const metadataObject = await s3
              .getObject({ Bucket: params.Bucket, Key: metadataKey })
              .promise();
            metadata = metadataObject?.Body
              ? JSON.parse(metadataObject.Body.toString())
              : {};
          } catch (error) {
            console.warn(`Metadata not found for ${file.Key}: ${error.message}`);
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
        prevFiles.map((f) =>
          f.key === oldKey ? { ...f, name: newFileName, key: newKey } : f
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

      setAudioFiles((prevFiles) => prevFiles.filter((f) => f.key !== fileKey));
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
    setErrorMessage(""); // Clear previous errors

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setErrorMessage("Invalid email format.");
      return;
    }

    try {
      if (user) {
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, profileData, { merge: true });

        // Update Firebase Auth displayName / email
        if (profileData.displayName !== user.displayName) {
          await updateProfile(user, { displayName: profileData.displayName });
        }
        if (profileData.email !== user.email) {
          await updateEmail(user, profileData.email);
        }

        setUser({ ...user, ...profileData });
        setEditMode(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile data:", error.message);
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMessage("Email is already in use.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email format.");
          break;
        default:
          setErrorMessage("Failed to update email. Please try again.");
      }
    }
  };

  const handlePasswordUpdate = async () => {
    setErrorMessage(""); // Clear previous error messages

    if (!newPassword || !confirmNewPassword) {
      setErrorMessage("Please fill out both password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setErrorMessage("User is not authenticated. Please log in again.");
        return;
      }

      await updatePassword(currentUser, newPassword);
      alert("Password updated successfully!");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordFields(false);
    } catch (error) {
      console.error("Error updating password:", error.message);
      switch (error.code) {
        case "auth/requires-recent-login":
          setErrorMessage(
            "This operation requires recent authentication. Please log out and log in again."
          );
          break;
        case "auth/weak-password":
          setErrorMessage("Password is too weak. Must be at least 6 characters.");
          break;
        default:
          setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  const Container = styled(Box)({
    display: "flex",
    flexDirection: "row",
    gap: "1.5rem",
    alignItems: "flex-start",
    "@media (max-width: 600px)": {
      flexDirection: "column",
    },
  });

  const LeftSection = styled(Box)(({ theme }) => ({
    flexBasis: "300px",
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
  }));

  const RightSection = styled(Card)(({ theme }) => ({
    flexGrow: 1,
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
  }));

  const AvatarWrapper = styled(Box)(({ theme }) => ({
    position: "relative",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    overflow: "hidden",
    border: `2px solid ${theme.palette.primary.main}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%",
    },
  }));

  const ChangeOverlay = styled(Box)(({ theme }) => ({
    position: "absolute",
    bottom: 0,
    width: "100%",
    textAlign: "center",
    padding: "4px 0",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    fontSize: "0.8rem",
    cursor: "pointer",
  }));

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
      <Container>
        {/* Left Section: Avatar & Image Upload */}
        <LeftSection>
          {/* Avatar / Image Upload */}
          <AvatarWrapper>
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="Profile" />
            ) : (
              <AccountCircleIcon style={{ fontSize: 80, color: "#ccc" }} />
            )}
            <ChangeOverlay>Change</ChangeOverlay>
          </AvatarWrapper>

          {/* Selected image preview (optional) */}
          {selectedImage && (
            <Box>
              <img
                src={selectedImage}
                alt="Preview"
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
            </Box>
          )}

          {/* Upload Buttons */}
          <Box display="flex" flexDirection="column" gap={1} width="100%">
            <Button variant="outlined" component="label">
              {selectedImage ? "Change Image" : "Select Image"}
              <input type="file" hidden onChange={handleImageChange} />
            </Button>
            {selectedImage && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleProfilePictureUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Picture"}
              </Button>
            )}
          </Box>
        </LeftSection>

        {/* Right Section: User Info */}
        <RightSection>
          <CardContent>

            {user ? (
              <Box mt={2}>
                {/* If NOT in edit mode, show Name & Email as plain text */}
                {!editMode ? (
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: 3,
                      
                      maxWidth: 400,
                      margin: "auto",
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {profileData?.displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {profileData?.email}
                        </Typography>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "flex-end", paddingX: 2, paddingBottom: 2 }}>
                      <Tooltip title="Edit Profile">
                        <IconButton
                          color="primary"
                          onClick={() => setEditMode(true)}
                          sx={{
                            border: "1px solid",
                            borderColor: "primary.main",
                            transition: "all 0.3s ease-in-out",
                            "&:hover": {
                              backgroundColor: "primary.main",
                              color: "#fff",
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                ) : (
                  // If in edit mode, show TextFields
                  <Box
                    mt={2}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      maxWidth: 400,
                    }}
                  >
                    <TextField
                      label="Name"
                      type="text"
                      variant="outlined"
                      size="small"
                      value={profileData.displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      type="email"
                      variant="outlined"
                      size="small"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={saveProfileData}
                    >
                      Save
                    </Button>
                  </Box>
                )}

                {/* Change Password Section */}
                {/* Change Password Section */}
                <Box mt={5} textAlign="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    Change Password
                  </Button>
                  {showPasswordFields && (
                    <Box
                      mt={2}
                      sx={{
                        maxWidth: 400,
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <TextField
                        label="New Password"
                        type="password"
                        size="small"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="Confirm Password"
                        type="password"
                        size="small"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handlePasswordUpdate}
                        sx={{ mt: 2 }}
                      >
                        Update Password
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" color="error">
                No user is logged in.
              </Typography>
            )}
          </CardContent>
        </RightSection>
      </Container>

      {errorMessage && (
        <Alert
          severity="error"
          className="profile-error"
          icon={<ErrorIcon />}
          variant="filled"
        >
          {errorMessage}
        </Alert>
      )}

      {/* Show/Hide Audio Files Button */}
      <Button
        variant="contained"
        sx={{ mt: 4 }}
        onClick={() => setShowAudioFiles(!showAudioFiles)}
        endIcon={showAudioFiles ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      >
        {showAudioFiles ? "Hide Audio Files" : "Show Audio Files"}
      </Button>

      {showAudioFiles && (
        <TableContainer
          component={Paper}
          sx={{
            mt: 4,
            borderRadius: 2,
            boxShadow: 3,
            overflow: "hidden", // hides any corner overlap
          }}
        >
          <Table sx={{ minWidth: 600 }}>
            {/* Table Head with a background color */}
            <TableHead sx={{ backgroundColor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  FILE NAME
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  BPM
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  GENRE
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  KEY
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {audioFiles.map((file, index) => (
                <StyledTableRow key={file.key} striped={index % 2 === 0}>
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
                      <Typography variant="body1" fontWeight="500">
                        {file.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {file.bpm} bpm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={file.genre}
                      color="secondary"
                      size="small"
                      icon={<MusicNoteIcon />}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={file.musicalKey}
                      variant="outlined"
                      color="primary"
                      size="small"
                      icon={<PianoIcon />}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    {editingFile?.key === file.key ? (
                      <Tooltip title="Save">
                        <IconButton onClick={handleSaveEdit} color="success">
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
                      <IconButton
                        onClick={() => handleDeleteFile(file.key)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Profile;
