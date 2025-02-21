import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/material/styles";

const RightSectionCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 1200,
  margin: "16px 0",
  boxSizing: "border-box",
  background: "#fff",
  border: "5px solid #1976D2",
  borderRadius: "16px",
  position: "relative",
  overflow: "hidden",
  zIndex: 0,
  padding: "16px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-8px",
    left: "-8px",
    right: "-8px",
    bottom: "-8px",
    background: "transparent",
    border: "8px solid rgba(25, 118, 210, 0.5)",
    borderRadius: "24px",
    zIndex: -1,
    pointerEvents: "none",
  },
  "&:hover": {
    boxShadow: "10px 6px 20px rgba(106, 17, 203, 0.15)",
  },
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
  maxWidth: 400,
  margin: "auto",
  transition: "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
    transform: "translateY(-4px)",
  },
}));

const ProfileRightSection = ({
  user,
  editMode,
  setEditMode,
  profileData,
  handleInputChange,
  saveProfileData,
  showPasswordFields,
  setShowPasswordFields,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  handlePasswordUpdate,
}) => {
  return (
    <RightSectionCard>
      <CardContent>
        {user ? (
          <Box>
            {/* User Info */}
            {!editMode ? (
              <ProfileCard>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h4" fontWeight="bold">
                      {profileData?.username}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {profileData?.email}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {profileData?.name} {profileData?.secondName} 
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
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
              </ProfileCard>
            ) : (
              <Box
                mt={2}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  maxWidth: 400,
                  margin: "auto",
                }}
              >
                <TextField
                  label="First Name"
                  type="text"
                  variant="outlined"
                  size="small"
                  value={profileData.name}
                  onChange={(e) =>
                    handleInputChange("name", e.target.value)
                  }
                  fullWidth
                />
                 <TextField
                  label="Second Name"
                  type="text"
                  variant="outlined"
                  size="small"
                  value={profileData.secondName}
                  onChange={(e) =>
                    handleInputChange("secondName", e.target.value)
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
                <TextField
                  label="Username"
                  type="username"
                  variant="outlined"
                  size="small"
                  value={profileData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveProfileData}
                  sx={{ mt: 2 }}
                >
                  Save
                </Button>
              </Box>
            )}
            {/* Password Update Section */}
            <Box mt={5} textAlign="center">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                sx={{ mb: 2 }}
              >
                {showPasswordFields ? "Cancel" : "Change Password"}
              </Button>
              {showPasswordFields && (
                <Box
                  mt={2}
                  sx={{
                    maxWidth: 400,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <TextField
                    label="New Password"
                    type="password"
                    size="small"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    size="small"
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
          <Typography variant="body1" color="error" align="center">
            No user is logged in.
          </Typography>
        )}
      </CardContent>
    </RightSectionCard>
  );
};

export default ProfileRightSection;