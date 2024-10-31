// src/LandingPage.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import "./LandingPage.css"; // Import the CSS file

const LandingPage = () => {
  const navigate = useNavigate();

  const handleCreateNewProject = () => {
    navigate("/upload");
  };

  const handleSelectPreviousProject = () => {
    alert("Selecting previous projects is not implemented yet!");
  };

  return (
    <Box className="landing-page-container">
      <Typography className="landing-page-title">Welcome to Your Project Portal</Typography>
      <Typography className="landing-page-subtitle">
        Select a previous project or create a new one to get started.
      </Typography>
      <Box className="landing-page-buttons">
        <Button
          className="landing-page-button primary"
          onClick={handleCreateNewProject}
        >
          Create New Project
        </Button>
        <Button
          className="landing-page-button secondary"
          onClick={handleSelectPreviousProject}
        >
          Select Previous Project
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
