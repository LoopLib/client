import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import WaveSurfer from "wavesurfer.js";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./edit.css";

const Edit = ({ audioFile, onBack }) => {
  const waveSurferRef = useRef(null); // Store WaveSurfer instance
  const [waveSurfer, setWaveSurfer] = useState(null); // Track instance for reactivity

  useEffect(() => {
    if (audioFile) {
      const ws = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#6a11cb",
        progressColor: "#000000",
        cursorColor: "#000000",
        barWidth: 5,
        responsive: true,
        height: 150,
        backend: "MediaElement",
      });

      ws.load(audioFile.url);
      setWaveSurfer(ws);

      return () => ws.destroy(); // Clean up on unmount
    }
  }, [audioFile]);

  const trimAudio = () => {
    if (waveSurfer) {
      const duration = waveSurfer.getDuration();
      const start = 2; // Example: Start trimming at 2 seconds
      const end = duration - 2; // Example: End trimming 2 seconds before
      waveSurfer.backend.media.currentTime = start;
      waveSurfer.backend.media.play();
      waveSurfer.on("timeupdate", () => {
        if (waveSurfer.backend.media.currentTime >= end) {
          waveSurfer.pause();
        }
      });
      alert("Trim applied. Preview the trimmed audio.");
    }
  };

  const applyEffects = () => {
    // Placeholder for effects like reverb, speed adjustment, etc.
    alert("Effects applied! Implement cool audio manipulations here.");
  };

  const saveAudio = () => {
    alert("Saving the edited audio. Implement upload or file-saving logic here.");
  };

  return (
    <Box className="edit-container">
      <Box className="edit-header">
        <IconButton onClick={onBack} className="back-button">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="edit-title">
          Edit Audio: {audioFile.name}
        </Typography>
      </Box>
      <Box id="waveform" className="waveform-container"></Box>
      <Box className="edit-actions">
        <Button variant="contained" onClick={trimAudio} className="edit-button">
          Trim
        </Button>
        <Button variant="contained" onClick={applyEffects} className="edit-button">
          Apply Effects
        </Button>
        <Button
          variant="contained"
          onClick={saveAudio}
          className="edit-button"
          endIcon={<SaveIcon />}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default Edit;
