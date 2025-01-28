import React from "react";
import { CircularProgress, Box } from "@mui/material";

const LoadingPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: "#fff", // Custom color
          animation: "spin 1.5s linear infinite", // Smooth spinning
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default LoadingPage;
