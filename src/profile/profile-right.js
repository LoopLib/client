// ProfileRightSection.js
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
  flexGrow: 1,
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
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
          <Box mt={2}>
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
                <CardActions
                  sx={{
                    justifyContent: "flex-end",
                    paddingX: 2,
                    paddingBottom: 2,
                  }}
                >
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
              <Box
                mt={2}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
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
    </RightSectionCard>
  );
};

export default ProfileRightSection;
