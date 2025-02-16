import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { styled } from "@mui/material/styles";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const StatisticsCard = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: "1200px",
    margin: "16px auto",
    boxSizing: "border-box",
    background: "#fff",
    border: "5px solid #1976D2",
    borderRadius: "16px",
    position: "relative",
    overflow: "hidden",
    zIndex: 0,
    padding: "16px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
    fontFamily: "Roboto, sans-serif",
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

const ChartBox = styled(Box)(({ theme }) => ({
    height: "220px", // smaller chart height on larger screens
    [theme.breakpoints.down("md")]: {
        height: "260px", // slightly larger charts on smaller screens
    },
    position: "relative",
}));

const Statistics = ({ audioFiles, audioFilesCount }) => {
    // Calculate Average BPM
    const validBpmFiles = audioFiles
        ? audioFiles.filter((file) => !isNaN(parseFloat(file.bpm)))
        : [];
    const averageBpm =
        validBpmFiles.length > 0
            ? (
                validBpmFiles.reduce(
                    (acc, file) => acc + parseFloat(file.bpm),
                    0
                ) / validBpmFiles.length
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#1976D2",
                    font: {
                        size: 12,
                        family: "Roboto, sans-serif",
                    },
                },
            },
        },
    };

    return (
        <StatisticsCard>
            <Box textAlign="center" mb={3}>
                <Typography
                    variant="h6"
                    className="audio-card-title"
                    style={{ fontWeight: 700, letterSpacing: "0.5px", marginBottom: "8px" }}
                >
                    Statistics
                </Typography>
                <Typography variant="body1">Uploaded Audio Files: {audioFilesCount}</Typography>
                <Typography variant="body1">Average BPM: {averageBpm}</Typography>
                <Typography variant="body1">
                    Unique Musical Keys: {keyLabels.length > 0 ? keyLabels.join(", ") : "N/A"}
                </Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Box mb={2}>
                        <Typography
                            variant="h6"
                            textAlign="center"
                            style={{
                                marginBottom: "8px",
                                color: "#1976D2",
                                fontWeight: 500,
                            }}
                        >
                            Genre Distribution
                        </Typography>
                        <ChartBox>
                            {genreLabels.length > 0 ? (
                                <Pie data={genreChartData} options={chartOptions} />
                            ) : (
                                <Typography variant="body2" textAlign="center">
                                    No genre data available.
                                </Typography>
                            )}
                        </ChartBox>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box mb={2}>
                        <Typography
                            variant="h6"
                            textAlign="center"
                            style={{
                                marginBottom: "8px",
                                color: "#1976D2",
                                fontWeight: 500,
                            }}
                        >
                            Musical Key Distribution
                        </Typography>
                        <ChartBox>
                            {keyLabels.length > 0 ? (
                                <Pie data={keyChartData} options={chartOptions} />
                            ) : (
                                <Typography variant="body2" textAlign="center">
                                    No musical key data available.
                                </Typography>
                            )}
                        </ChartBox>
                    </Box>
                </Grid>
            </Grid>
        </StatisticsCard>
    );
};

export default Statistics;
