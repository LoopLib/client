// Edit.js

import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AudioCard from "../audiocard/audiocard";
import "./edit.css";

const Edit = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Since AudioCard expects waveSurferRefs and activeIndexes, we set them up here
  const waveSurferRefs = useRef({});
  const [activeIndexes, setActiveIndexes] = useState([]);

  if (!state?.file) {
    return <Typography>No file selected for editing.</Typography>;
  }

  const handleBack = () => navigate(-1);

  const handleContextMenu = (event) => {
    event.preventDefault();
    // Implement any context menu functionality if needed
  };

  return (
    <Box className="edit-container">
      <Box className="edit-header">
        <IconButton onClick={handleBack} className="back-button">
          <ArrowBackIcon />
        </IconButton>
      </Box>
      
      {/* Render the AudioCard component */}
      <AudioCard
        file={state.file}
        index={0} // Since it's a single file, index can be 0
        activeIndexes={activeIndexes}
        setActiveIndexes={setActiveIndexes}
        waveSurferRefs={waveSurferRefs}
        onContextMenu={handleContextMenu}
      />

      <Box className="edit-actions" mt={4}>
        <Button
          variant="contained"
          className="edit-button trim"
          onClick={() => alert("Trimming functionality coming soon!")}
          sx={{ mr: 2 }}
        >
          Trim Audio
        </Button>
        <Button
          variant="contained"
          className="edit-button effects"
          onClick={() => alert("Effects functionality coming soon!")}
          sx={{ mr: 2 }}
        >
          Apply Effects
        </Button>
        <Button
          variant="contained"
          className="edit-button save"
          onClick={() => alert("Save functionality coming soon!")}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default Edit;
