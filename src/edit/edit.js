import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography, Button, Divider } from "@mui/material";
import AudioCard from "../home/audio-card/audio-card";
import "./edit.css";

const Edit = () => {
  const { state } = useLocation();
  const waveSurferRefs = useRef({});
  const [activeIndexes, setActiveIndexes] = useState([]);

  if (!state?.file) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography>No file selected for editing.</Typography>
      </Box>
    );
  }

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      className="edit-container"
      sx={{
        width: "80%",
        maxWidth: "1200px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#ffffff",
      }}
    >
      <Box className="edit-header" display="flex" alignItems="center">
        <Typography
          variant="h4"
          className="all-audio-title"
          mb={4}
          fontFamily={"Montserrat, sans-serif"}
          fontWeight="bold"
        >
          E D I T
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <AudioCard
        file={state.file}
        index={0}
        activeIndexes={activeIndexes}
        setActiveIndexes={setActiveIndexes}
        waveSurferRefs={waveSurferRefs}
        onContextMenu={handleContextMenu}
      />

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          onClick={() => alert("Trimming functionality coming soon!")}
          sx={{ mr: 2 }}
        >
          Trim Audio
        </Button>
        <Button
          variant="contained"
          onClick={() => alert("Effects functionality coming soon!")}
          sx={{ mr: 2 }}
        >
          Apply Effects
        </Button>
        <Button
          variant="contained"
          onClick={() => alert("Save functionality coming soon!")}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default Edit;
