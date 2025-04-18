// Import necessary React and Material UI components
import React from "react";
import { Box, Typography, Grid, Card, CardContent, CardHeader, Paper, useTheme } from "@mui/material";
// Import Pie chart from react-chartjs-2
import { Pie } from "react-chartjs-2";
// Import styled utility for custom styling
import { styled } from "@mui/material/styles";
// Import required Chart.js components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

// Register Chart.js components for Pie chart
ChartJS.register(ArcElement, ChartTooltip, Legend);

// Create a styled card component with advanced styling
const AdvancedCard = styled(Card)(({ theme }) => ({
  maxWidth: 1200, // Max width of the card
  margin: "32px auto", // Centered horizontally with vertical spacing
  borderRadius: 16, // Rounded corners
  overflow: "hidden", // Hide overflow content
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)", // Shadow styling
  border: "none", // Remove default border
}));

// Styled container for charts with fixed height
const ChartContainer = styled(Box)(({ theme }) => ({
  height: 300, // Fixed height for charts
  position: "relative", // Relative positioning
  display: "flex", // Flex layout
  justifyContent: "center", // Center horizontally
  alignItems: "center", // Center vertically
}));

// Styled paper box for summary stats like BPM, file count
const StatBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2), // Padding inside box
  textAlign: "center", // Center-align text
  borderRadius: theme.shape.borderRadius, // Rounded corners using theme
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)", // Box shadow
  background: theme.palette.background.paper, // Use theme background
  transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth hover effects
  "&:hover": {
    transform: "translateY(-4px)", // Lift box on hover
    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.15)", // Stronger shadow on hover
  },
}));

// Main statistics component, accepts audio files and file count as props
const Statistics = ({ audioFiles, audioFilesCount }) => {
  const theme = useTheme(); // Access theme for styling

  // Filter out files with valid BPM values
  const validBpmFiles = audioFiles ? audioFiles.filter(file => !isNaN(parseFloat(file.bpm))) : [];
  
  // Calculate average BPM if valid files exist, else show "N/A"
  const averageBpm = validBpmFiles.length > 0
    ? (validBpmFiles.reduce((acc, file) => acc + parseFloat(file.bpm), 0) / validBpmFiles.length).toFixed(1)
    : "N/A";

  // Count occurrences of each genre (excluding "Unknown")
  const genreCounts = audioFiles
  ? audioFiles.reduce((acc, file) => {
      if (file.genre && file.genre !== "Unknown") {
        acc[file.genre] = (acc[file.genre] || 0) + 1; // Increment genre count
      }
      return acc;
    }, {})
  : {};

  // Extract genre labels and values for chart data
  const genreLabels = Object.keys(genreCounts);
  const genreData = Object.values(genreCounts);
  
  // Chart.js data config for genre pie chart
  const genreChartData = {
    labels: genreLabels,
    datasets: [{
      label: "Genre Distribution",
      data: genreData,
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2", "#00FA9A", "#FF4500", "#1E90FF"], // Chart colors
      borderColor: "#fff", // White border
      borderWidth: 2, // Border thickness
    }],
  };

  // Count occurrences of each musical key (excluding "Unknown")
  const musicalKeyCounts = audioFiles
    ? audioFiles.reduce((acc, file) => {
      if (file.musicalKey && file.musicalKey !== "Unknown") {
        acc[file.musicalKey] = (acc[file.musicalKey] || 0) + 1;
      }
      return acc;
    }, {})
    : {};

  // Extract labels and values for musical key chart
  const keyLabels = Object.keys(musicalKeyCounts);
  const keyData = Object.values(musicalKeyCounts);
  
  // Chart.js data config for musical key pie chart
  const keyChartData = {
    labels: keyLabels,
    datasets: [{
      label: "Musical Key Distribution",
      data: keyData,
      backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#8A2BE2", "#00FA9A", "#FF4500", "#1E90FF"],
      borderColor: "#fff",
      borderWidth: 2,
    }],
  };

  // Count occurrences of each instrument (excluding "Unknown")
  const instrumentCounts = audioFiles
    ? audioFiles.reduce((acc, file) => {
      if (file.instrument && file.instrument !== "Unknown") {
        acc[file.instrument] = (acc[file.instrument] || 0) + 1;
      }
      return acc;
    }, {})
    : {};

  // Extract labels and values for instrument chart
  const instrumentLabels = Object.keys(instrumentCounts);
  const instrumentData = Object.values(instrumentCounts);
  
  // Chart.js data config for instrument pie chart
  const instrumentChartData = {
    labels: instrumentLabels,
    datasets: [{
      label: "Instrument Distribution",
      data: instrumentData,
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2", "#00FA9A", "#FF4500", "#1E90FF"],
      borderColor: "#fff",
      borderWidth: 2,
    }],
  };

// Chart display options
const chartOptions = {
  responsive: true, // Chart resizes based on container
  maintainAspectRatio: false, // Allow free height resizing
  animation: {
    animateScale: true, // Scale animation
    animateRotate: true, // Rotate animation
  },
  plugins: {
    legend: {
      position: "bottom", // Show legend below chart
      labels: {
        color: theme.palette.text.primary, // Text color from theme
        font: {
          size: 13,
          family: "Roboto, sans-serif",
        },
        boxWidth: 15, // Size of color boxes
        padding: 10, // Space between legend items
      },
    },
  },
};

  // Component render
  return (
    <AdvancedCard>
      <CardHeader 
        title="Statistics" // Header title
        titleTypographyProps={{ variant: "p", fontWeight: "700", fontFamily: "Roboto, sans-serif" }} // Typography styling
        sx={{
          background: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)", // Gradient background
          color: "#fff", // White text
          textAlign: "center", // Centered title
          py: 2, // Vertical padding
        }}
      />
      <CardContent>
        {/* Section for summary stats */}
        <Box mb={4}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="subtitle2" fontWeight="600" color="textSecondary">
                  Uploaded Files
                </Typography>
                <Typography variant="h6" fontWeight="700">
                  {audioFilesCount} {/* Show number of uploaded files */}
                </Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatBox>
                <Typography variant="subtitle2" fontWeight="600" color="textSecondary">
                  Average BPM
                </Typography>
                <Typography variant="h6" fontWeight="700">
                  {averageBpm} {/* Show calculated average BPM */}
                </Typography>
              </StatBox>
            </Grid>
          </Grid>
        </Box>

        {/* Section for pie charts */}
        <Grid container spacing={4}>
          {/* Genre Pie Chart */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 500 }}>
                Genre
              </Typography>
              <ChartContainer>
                {genreLabels.length > 0 ? (
                  <Pie data={genreChartData} options={chartOptions} />
                ) : (
                  <Typography variant="body2" textAlign="center">No genre data available.</Typography>
                )}
              </ChartContainer>
            </Box>
          </Grid>

          {/* Musical Key Pie Chart */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 500 }}>
                Key
              </Typography>
              <ChartContainer>
                {keyLabels.length > 0 ? (
                  <Pie data={keyChartData} options={chartOptions} />
                ) : (
                  <Typography variant="body2" textAlign="center">No musical key data available.</Typography>
                )}
              </ChartContainer>
            </Box>
          </Grid>

          {/* Instrument Pie Chart */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" textAlign="center" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 500 }}>
                Instrument
              </Typography>
              <ChartContainer>
                {instrumentLabels.length > 0 ? (
                  <Pie data={instrumentChartData} options={chartOptions} />
                ) : (
                  <Typography variant="body2" textAlign="center">No instrument data available.</Typography>
                )}
              </ChartContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </AdvancedCard>
  );
};

// Export the component for use elsewhere
export default Statistics;
