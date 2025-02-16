// ProfileLeftSection.js
import React from "react";
import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

// Replace this URL with your preferred default image if needed.
const defaultPictureUrl = "https://i.pravatar.cc/180?img=1";

const LeftSectionContainer = styled(Box)(({ theme }) => ({
  flexBasis: "300px",
  flexShrink: 0,
  background: "linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(3),
  transition: "background 0.3s ease",
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "180px",
  height: "180px",
  borderRadius: "50%",
  overflow: "hidden",
  border: `3px solid ${theme.palette.primary.main}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    "& .overlay": {
      opacity: 1,
    },
  },
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
  padding: "8px 0",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
  opacity: 0,
  transition: "opacity 0.3s ease",
  zIndex: 1,
}));

const PreviewImage = styled("img")(({ theme }) => ({
  maxWidth: "100%",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
}));

const ProfileLeftSection = ({
  profilePictureUrl,
  selectedImage,
  uploading,
  handleImageChange,
  handleProfilePictureUpload,
}) => {
  // Use the provided profile picture or fallback to the default picture.
  const imageSrc = profilePictureUrl || defaultPictureUrl;

  const defaultAvatar = "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png";


  return (
    <LeftSectionContainer>
      <AvatarWrapper>
        <img
          src={imageSrc || defaultAvatar}
          alt="Profile"
          onError={(e) => (e.target.src = defaultAvatar)}
        />
        <ChangeOverlay className="overlay">Change</ChangeOverlay>
      </AvatarWrapper>

      {selectedImage && (
        <Box width="100%">
          <PreviewImage src={selectedImage} alt="Preview" />
        </Box>
      )}

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
