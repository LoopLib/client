// Profile.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import AWS from "aws-sdk";
import LoadingPage from "../loading/loading";
import ProfileLeftSection from "./profile-left";
import ProfileRightSection from "./profile-right";
import AudioFilesTable from "./audio-table";
import { fetchLikedAudioFiles } from "./fetchLikedAudioFiles";
import LikedAudioCarousel from "./audio-carousel";
import "./profile.css";

const Container = styled(Box)({
  display: "flex",
  flexDirection: "row",
  gap: "1.5rem",
  alignItems: "flex-start",
  "@media (max-width: 600px)": {
    flexDirection: "column",
  },
});

const Profile = () => {
  // STATE VARIABLES
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
  // For password change:
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showLikedAudio, setShowLikedAudio] = useState(false);
  const [likedAudioFiles, setLikedAudioFiles] = useState([]);
  // For error messages:
  const [errorMessage, setErrorMessage] = useState("");

  // EFFECTS

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
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchLikedAudio = async () => {
      const likedFiles = await fetchLikedAudioFiles();
      setLikedAudioFiles(likedFiles);
      setShowLikedAudio(true); // Automatically show liked audio
    };

    fetchLikedAudio();
  }, []);


  // FUNCTIONS

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
            const metadataObject = await s3
              .getObject({ Bucket: params.Bucket, Key: metadataKey })
              .promise();
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
    const maxSizeInBytes = 5 * 1024 * 1024;
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
    setErrorMessage("");

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
    setErrorMessage("");

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

  const handleShowLikedAudio = async () => {
    if (!showLikedAudio) {
      const likedFiles = await fetchLikedAudioFiles();
      setLikedAudioFiles(likedFiles);
    }
    setShowLikedAudio(!showLikedAudio);
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
      <Container>
        <ProfileLeftSection
          profilePictureUrl={profilePictureUrl}
          selectedImage={selectedImage}
          uploading={uploading}
          handleImageChange={handleImageChange}
          handleProfilePictureUpload={handleProfilePictureUpload}
        />
        <ProfileRightSection
          user={user}
          editMode={editMode}
          setEditMode={setEditMode}
          profileData={profileData}
          handleInputChange={handleInputChange}
          saveProfileData={saveProfileData}
          showPasswordFields={showPasswordFields}
          setShowPasswordFields={setShowPasswordFields}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmNewPassword={confirmNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
          handlePasswordUpdate={handlePasswordUpdate}
        />
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

      <Box>
        <LikedAudioCarousel likedAudioFiles={likedAudioFiles} />
        <Button
          variant="contained"
          sx={{ mt: 4 }}
          onClick={() => setShowAudioFiles(!showAudioFiles)}
          endIcon={showAudioFiles ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {showAudioFiles ? "Hide Audio Files" : "Show Audio Files"}
        </Button>
      </Box>
      {showAudioFiles && (
        <AudioFilesTable
          audioFiles={audioFiles}
          editingFile={editingFile}
          newFileName={newFileName}
          setNewFileName={setNewFileName}
          handleEditFile={handleEditFile}
          handleSaveEdit={handleSaveEdit}
          handleDeleteFile={handleDeleteFile}
        />
      )}
    </Box>
  );
};

export default Profile;