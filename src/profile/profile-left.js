// ProfileLeftSection.js
import React from "react";
import { Box, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { styled } from "@mui/material/styles";

const LeftSectionContainer = styled(Box)(({ theme }) => ({
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

const ProfileLeftSection = ({
  profilePictureUrl,
  selectedImage,
  uploading,
  handleImageChange,
  handleProfilePictureUpload,
}) => {
  return (
    <LeftSectionContainer>
      <AvatarWrapper>
        {profilePictureUrl ? (
          <img src={profilePictureUrl} alt="Profile" />
        ) : (
          <AccountCircleIcon style={{ fontSize: 80, color: "#ccc" }} />
        )}
        <ChangeOverlay>Change</ChangeOverlay>
      </AvatarWrapper>

      {selectedImage && (
        <Box>
          <img
            src={selectedImage}
            alt="Preview"
            style={{ maxWidth: "100%", borderRadius: 8 }}
          />
        </Box>
      )}

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
    </LeftSectionContainer>
  );
};

export default ProfileLeftSection;
