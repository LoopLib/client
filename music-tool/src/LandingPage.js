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
    
  );
};

export default LandingPage;
