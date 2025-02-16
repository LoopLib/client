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
  Grid
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/material/styles";

const RightSectionCard = styled(Card)(({ theme }) => ({
  flexGrow: 1,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  maxWidth: 400,
  margin: "auto",
  transition: "box-shadow 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[6],
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
  audioFilesCount, // New prop
}) => {
  return (
    <RightSectionCard>
      <CardContent>
        {user ? (
          <Grid container spacing={2}>
            {/* Left Side: User Info */}
            <Grid item xs={12} md={6}>
              {!editMode ? (
                <ProfileCard>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h4" fontWeight="bold">
                        {profileData?.displayName}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {profileData?.email}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {profileData?.username}
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
            </Grid>

            {/* Right Side: Statistics */}
            <Grid item xs={12} md={6}>
              <Box mt={2} textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  Statistics
                </Typography>
                <Typography variant="body1">
                  Uploaded Audio Files: {audioFilesCount}
                </Typography>
                {/* Add other statistics as needed */}
              </Box>
            </Grid>
          </Grid>
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
