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
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/material/styles";

// Import Chart components
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, ChartTooltip, Legend);

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
  audioFilesCount,
  audioFiles, // New prop
}) => {
  // Compute additional statistics
  const totalFiles = audioFiles ? audioFiles.length : 0;
  const validBpmFiles = audioFiles
    ? audioFiles.filter((file) => !isNaN(parseFloat(file.bpm)))
    : [];
  const averageBpm =
    validBpmFiles.length > 0
      ? (
          validBpmFiles.reduce((acc, file) => acc + parseFloat(file.bpm), 0) /
          validBpmFiles.length
        ).toFixed(1)
      : "N/A";

  // Genre Distribution Data
  const genreCounts = audioFiles
    ? audioFiles.reduce((acc, file) => {
        if (file.genre && file.genre !== "Unknown") {
          acc[file.genre] = (acc[file.genre] || 0) + 1;
        }
        return acc;
      }, {})
    : {};
  const genreLabels = Object.keys(genreCounts);
  const genreData = Object.values(genreCounts);
  const genreChartData = {
    labels: genreLabels,
    datasets: [
      {
        label: "Genre Distribution",
        data: genreData,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#8A2BE2",
          "#00FA9A",
          "#FF4500",
          "#1E90FF",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // Musical Key Distribution Data
  const musicalKeyCounts = audioFiles
    ? audioFiles.reduce((acc, file) => {
        if (file.musicalKey && file.musicalKey !== "Unknown") {
          acc[file.musicalKey] = (acc[file.musicalKey] || 0) + 1;
        }
        return acc;
      }, {})
    : {};
  const keyLabels = Object.keys(musicalKeyCounts);
  const keyData = Object.values(musicalKeyCounts);
  const keyChartData = {
    labels: keyLabels,
    datasets: [
      {
        label: "Musical Key Distribution",
        data: keyData,
        backgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#8A2BE2",
          "#00FA9A",
          "#FF4500",
          "#1E90FF",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

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

            {/* Right Side: Statistics & Charts */}
            <Grid item xs={12} md={6}>
              <Box mt={2} textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  Statistics
                </Typography>
                <Typography variant="body1">
                  Uploaded Audio Files: {audioFilesCount}
                </Typography>
                <Typography variant="body1">
                  Average BPM: {averageBpm}
                </Typography>
                <Typography variant="body1">
                  Unique Musical Keys:{" "}
                  {keyLabels.length > 0 ? keyLabels.join(", ") : "N/A"}
                </Typography>
              </Box>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {/* Genre Distribution Chart */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: 2,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Genre Distribution
                    </Typography>
                    {genreLabels.length > 0 ? (
                      <Pie data={genreChartData} />
                    ) : (
                      <Typography variant="body2">
                        No genre data available.
                      </Typography>
                    )}
                  </Box>
                </Grid>
                {/* Musical Key Distribution Chart */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: 2,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Musical Key Distribution
                    </Typography>
                    {keyLabels.length > 0 ? (
                      <Pie data={keyChartData} />
                    ) : (
                      <Typography variant="body2">
                        No musical key data available.
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
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
