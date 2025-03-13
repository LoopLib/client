import React, { useState } from "react";
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
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MuiAlert from '@mui/material/Alert';
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";

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
  const theme = useTheme();

  const [openNotification, setOpenNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const handleNotificationOpen = (message, type = "success") => {
    setNotificationMessage(message);
    setSeverity(type);
    setOpenNotification(true);
  };

  const handleNotificationClose = () => {
    setOpenNotification(false);
  };

  const handleProfileSave = () => {
    saveProfileData();
    handleNotificationOpen("Profile details updated successfully!");
  };

  const handlePasswordSave = () => {
    handlePasswordUpdate();
    handleNotificationOpen("Password updated successfully!");
  };

  return (
    <RightSectionCard>
      <CardContent>
        {user ? (
          <Box>
            {/* User Info */}
            {!editMode ? (
              <ProfileCard>
                <CardContent>
                  <Stack spacing={3}>
                    {/* Username with Larger Font and Icon */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="Username" arrow>
                        <IconButton size="small" sx={{ color: "primary.main", "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" } }}>
                          <AccountCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ fontSize: "1.5rem", lineHeight: "1.2" }}>
                        {profileData?.username}
                      </Typography>

                    </Box>

                    {/* Email with an Icon */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="Email" arrow>
                        <IconButton size="small" sx={{ color: "text.secondary", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" } }}>
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1rem" }}>
                        {profileData?.email}
                      </Typography>

                    </Box>

                    {/* Full Name with smaller text and icon */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="Full Name" arrow>
                        <IconButton size="small" sx={{ color: "text.secondary", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" } }}>
                          <PersonIcon />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                        {profileData?.name} {profileData?.secondName}
                      </Typography>

                    </Box>
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
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                <TextField
                  label="First Name"
                  type="text"
                  variant="outlined"
                  size="small"
                  value={profileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
                <TextField
                  label="Second Name"
                  type="text"
                  variant="outlined"
                  size="small"
                  value={profileData.secondName}
                  onChange={(e) => handleInputChange("secondName", e.target.value)}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  size="small"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
                <TextField
                  label="Username"
                  type="text"
                  variant="outlined"
                  size="small"
                  value={profileData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleProfileSave}
                  sx={{ mt: 2, borderRadius: "20px", padding: "10px 20px" }}
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
                sx={{
                  mb: 2,
                  borderRadius: "20px",
                  padding: "8px 20px",
                }}
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
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    size="small"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePasswordSave}
                    sx={{
                      padding: "10px 20px",
                      borderRadius: "20px",
                      mt: 2,
                    }}
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

      {/* Notification Snackbar */}
      <Snackbar
        open={openNotification}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleNotificationClose}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {notificationMessage}
        </MuiAlert>
      </Snackbar>
    </RightSectionCard>
  );
};

export default ProfileRightSection;
