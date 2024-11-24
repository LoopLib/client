import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import PauseIcon from "@mui/icons-material/Pause";
import WaveSurfer from "wavesurfer.js";
import "./edit.css";

const Edit = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const waveSurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!state?.file) return;

    // Initialize WaveSurfer
    const waveSurfer = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#E0E0E0",
      progressColor: "#6A11CB",
      cursorColor: "#6A11CB",
      barWidth: 3,
      responsive: true,
      height: 150,
      backend: "MediaElement",
    });

    waveSurfer.load(state.file.url);
    waveSurferRef.current = waveSurfer;

    waveSurfer.on("finish", () => setIsPlaying(false));

    return () => {
      // Cleanup: Safely destroy the instance
      if (waveSurferRef.current) {
        try {
          waveSurferRef.current.destroy(); // Safely destroy WaveSurfer
        } catch (error) {
          console.error("WaveSurfer cleanup error:", error);
        } finally {
          waveSurferRef.current = null; // Clear reference
        }
      }
    };
  }, [state]);

  if (!state?.file) {
    return <Typography>No file selected for editing.</Typography>;
  }

  const handleBack = () => navigate(-1);

  const togglePlay = () => {
    const waveSurfer = waveSurferRef.current;
    if (waveSurfer) {
      if (waveSurfer.isPlaying()) {
        waveSurfer.pause();
        setIsPlaying(false);
      } else {
        waveSurfer.play();
        setIsPlaying(true);
      }
    }
  };

  const stopPlayback = () => {
    const waveSurfer = waveSurferRef.current;
    if (waveSurfer) {
      waveSurfer.stop();
      setIsPlaying(false);
    }
  };

  return (
    <Box className="edit-container">
      <Box className="edit-header">
        <IconButton onClick={handleBack} className="back-button">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="edit-title">
          Editing: <span className="file-name">{state.file.name}</span>
        </Typography>
      </Box>
      <Box id="waveform" className="waveform-container"></Box>
      <Box className="playback-controls">
        <IconButton
          onClick={togglePlay}
          className={`playback-button ${isPlaying ? "playing" : ""}`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton
          onClick={stopPlayback}
          className="playback-button stop"
          aria-label="Stop"
        >
          <StopIcon />
        </IconButton>
      </Box>
      <Box className="edit-actions">
        <Button
          variant="contained"
          className="edit-button trim"
          onClick={() => alert("Trimming functionality coming soon!")}
        >
          Trim Audio
        </Button>
        <Button
          variant="contained"
          className="edit-button effects"
          onClick={() => alert("Effects functionality coming soon!")}
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
