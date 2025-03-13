import React from "react";
import { Box, Typography, Grid, Card, CardContent, CardHeader, Paper, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { styled } from "@mui/material/styles";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, ChartTooltip, Legend);

// Advanced container with gradient header
const AdvancedCard = styled(Card)(({ theme }) => ({
  maxWidth: 1200,
  margin: "32px auto",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
  border: "none",
}));

// Container for each pie chart with responsive height
const ChartContainer = styled(Box)(({ theme }) => ({
  height: 260,
  position: "relative",
  [theme.breakpoints.down("md")]: {
    height: 280,
  },
}));

// Styled box for each summary statistic
const StatBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
  background: theme.palette.background.paper,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.15)",
  },
}));

const Statistics = ({ audioFiles, audioFilesCount }) => {
  const theme = useTheme();

  // Calculate Average BPM
  const validBpmFiles = audioFiles ? audioFiles.filter(file => !isNaN(parseFloat(file.bpm))) : [];
  const averageBpm = validBpmFiles.length > 0
    ? (validBpmFiles.reduce((acc, file) => acc + parseFloat(file.bpm), 0) / validBpmFiles.length).toFixed(1)
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
    datasets: [{
      label: "Genre Distribution",
      data: genreData,
      backgroundColor: [
        "#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2", "#00FA9A", "#FF4500", "#1E90FF",
      ],
      borderColor: "#fff",
      borderWidth: 2,
    }],
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
    datasets: [{
      label: "Musical Key Distribution",
      data: keyData,
      backgroundColor: [
        "#36A2EB", "#FF6384", "#FFCE56", "#8A2BE2", "#00FA9A", "#FF4500", "#1E90FF",
      ],
      borderColor: "#fff",
      borderWidth: 2,
    }],
  };

  // Chart options with smooth animations and theme-based styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
    },
    plugins: {
      legend: {
        labels: {
          color: theme.palette.text.primary,
          font: {
            size: 13,
            family: "Roboto, sans-serif",
          },
        },
      },
    },
  };

  return (
    <AdvancedCard>
      <CardHeader 
        title="Statistics"
        titleTypographyProps={{ variant: "h5", fontWeight: "700", fontFamily: "Roboto, sans-serif" }}
        sx={{
          background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
          color: "#fff",
          textAlign: "center",
          py: 2,
        }}
      />
      <CardContent>
        {/* Summary Data Section */}
        <Box mb={4}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="subtitle2" fontWeight="600" color="textSecondary">
                  Uploaded Files
                </Typography>
                <Typography variant="h6" fontWeight="700">
                  {audioFilesCount}
                </Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="subtitle2" fontWeight="600" color="textSecondary">
                  Average BPM
                </Typography>
                <Typography variant="h6" fontWeight="700">
                  {averageBpm}
                </Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="subtitle2" fontWeight="600" color="textSecondary">
                  Unique Keys
                </Typography>
                <Typography variant="h6" fontWeight="700">
                  {keyLabels.length > 0 ? keyLabels.join(", ") : "N/A"}
                </Typography>
              </StatBox>
            </Grid>
          </Grid>
        </Box>

        {/* Charts Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 500 }}>
                Genre Distribution
              </Typography>
              <ChartContainer>
                {genreLabels.length > 0 ? (
                  <Pie data={genreChartData} options={chartOptions} />
                ) : (
                  <Typography variant="body2" textAlign="center">
                    No genre data available.
                  </Typography>
                )}
              </ChartContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 500 }}>
                Musical Key Distribution
              </Typography>
              <ChartContainer>
                {keyLabels.length > 0 ? (
                  <Pie data={keyChartData} options={chartOptions} />
                ) : (
                  <Typography variant="body2" textAlign="center">
                    No musical key data available.
                  </Typography>
                )}
              </ChartContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </AdvancedCard>
  );
};

export default Statistics;
