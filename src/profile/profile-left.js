// ProfileLeftSection.js
import React from "react";
import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

// Default fallback profile picture URL
const defaultPictureUrl = "https://i.pravatar.cc/180?img=1";

// Styled container for the left section of the profile
const LeftSectionContainer = styled(Box)(({ theme }) => ({
  flexBasis: "300px", // fixed width for the section
  flexShrink: 0,
  background: "linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)", // subtle gradient background
  borderRadius: theme.shape.borderRadius * 2, // more rounded corners
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // soft shadow
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(3), // vertical spacing between children
  transition: "background 0.3s ease",
}));

// Wrapper for the profile avatar image with hover effect
const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "180px",
  height: "180px",
  borderRadius: "50%", // circular shape
  overflow: "hidden",
  border: `3px solid ${theme.palette.primary.main}`, // border with theme primary color
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)", // zoom on hover
    "& .overlay": {
      opacity: 1, // show overlay on hover
    },
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover", // ensure the image fills the container
    borderRadius: "50%",
  },
}));

// Overlay text shown when hovering over avatar
const ChangeOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  width: "100%",
  textAlign: "center",
  padding: "8px 0",
  backgroundColor: "rgba(0, 0, 0, 0.6)", // semi-transparent black background
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
  opacity: 0, // initially hidden
  transition: "opacity 0.3s ease",
  zIndex: 1,
}));

// Styled preview image of the selected profile picture
const PreviewImage = styled("img")(({ theme }) => ({
  maxWidth: "100%",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // subtle shadow around preview
}));

// Main component for rendering the left section of the profile
const ProfileLeftSection = ({
  profilePictureUrl, // current profile picture URL
  selectedImage,     // image selected by the user (preview before upload)
  uploading,         // boolean indicating if upload is in progress
  handleImageChange, // function to handle file input change
  handleProfilePictureUpload, // function to trigger image upload
}) => {
  // Choose between current picture or default if none provided
  const imageSrc = profilePictureUrl || defaultPictureUrl;

  // Backup avatar in case image fails to load
  const defaultAvatar = "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png";

  return (
    <LeftSectionContainer>
      {/* Avatar with overlay on hover */}
      <AvatarWrapper>
        <img
          src={imageSrc || defaultAvatar}
          alt="Profile"
          onError={(e) => (e.target.src = defaultAvatar)} // fallback if image fails to load
        />
        <ChangeOverlay className="overlay">Change</ChangeOverlay>
      </AvatarWrapper>

      {/* Show image preview if a file is selected */}
      {selectedImage && (
        <Box width="100%">
          <PreviewImage src={selectedImage} alt="Preview" />
        </Box>
      )}

      {/* Buttons for selecting and uploading image */}
      <Box display="flex" flexDirection="column" gap={2} width="100%">
        <Button variant="outlined" component="label" fullWidth>
          {selectedImage ? "Change Image" : "Select Image"}
          <input type="file" hidden onChange={handleImageChange} />
        </Button>
        {selectedImage && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleProfilePictureUpload}
            disabled={uploading}
            fullWidth
          >
            {uploading ? "Uploading..." : "Upload Picture"}
          </Button>
        )}
      </Box>
    </LeftSectionContainer>
  );
};

export default ProfileLeftSection;
