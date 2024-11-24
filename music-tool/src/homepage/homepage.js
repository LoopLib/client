import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Library from "../library/library"; // Import the Library component
import "./homepage.css"; // Import the CSS file

const HomePage = () => {
  return (
    <Box className="landing-page-container">
      <Library /> 
    </Box>
  );
};

export default HomePage;
