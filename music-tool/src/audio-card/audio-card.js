import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, IconButton, Button } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import DownloadIcon from "@mui/icons-material/Download";
import { Avatar } from "@mui/material";
import Metadata from "../metadata-card/metadata-card";
import WaveSurfer from "wavesurfer.js";
import "./audio-card.css";

const AudioCard = ({
  file,
  index,
  activeIndexes,
  setActiveIndexes,
  waveSurferRefs,
  onContextMenu,
}) => {
  const [duration, setDuration] = useState("N/A");

  const initializeWaveSurfer = (url, index) => {
    const container = document.getElementById(`waveform-${index}`);
    if (!container) {
      console.error(`Container #waveform-${index} not found.`);
      return;
    }
    if (!waveSurferRefs.current[index]) {
      console.log("Initializing WaveSurfer for index:", index);
      const waveSurfer = WaveSurfer.create({
        container: `#waveform-${index}`,
        waveColor: "#6a11cb",
        progressColor: "#000000",
        cursorColor: "#000000",
        barWidth: 5,
        responsive: true,
        height: 80,
        backend: "MediaElement",
      });

      waveSurfer.load(url);
      waveSurferRefs.current[index] = waveSurfer;

      waveSurfer.on("ready", () => {
        setDuration(formatDuration(waveSurfer.getDuration()));
      });

      waveSurfer.on("finish", () => {
        setActiveIndexes((prev) => prev.filter((i) => i !== index));
      });
    }
  };

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.round(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = (index) => {
    const waveSurfer = waveSurferRefs.current[index];
    if (waveSurfer) {
      if (waveSurfer.isPlaying()) {
        waveSurfer.pause();
        setActiveIndexes((prev) => prev.filter((i) => i !== index));
      } else {
        waveSurfer.play();
        setActiveIndexes((prev) => [...prev, index]);
      }
    }
  };

  return (
    <Card
      className={`audio-card ${activeIndexes.includes(index) ? "active" : ""}`}
      sx={{
        mb: 8,
        borderRadius: 4,
        position: "relative",
        width: "100%",
        mx: "auto",
      }}
      onMouseEnter={() => initializeWaveSurfer(file.url, index)}
      onContextMenu={onContextMenu}
    >
      <Avatar
        alt={file.publisher}
        src={file.profilePicture}
        sx={{
          position: "absolute",
          top: 8,
          right: 20,
          width: 50,
          height: 50,
          border: "3px solid",
          borderColor: "primary.main",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        }}
      />

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={9}>
          <CardContent>
            <Typography variant="body2" gutterBottom>
              {file.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Publisher: {file.publisher}
            </Typography>

            <div id={`waveform-${index}`} className="waveform-container"></div>

            {/* Pass Duration to Metadata */}
            <Metadata
              duration={duration}
              musicalKey={file.musicalKey}
              bpm={file.bpm}
              genre={file.genre}
            />

            <Button
              variant="contained"
              color="primary"
              style={{
                position: "absolute",
                right: "16px",
                bottom: "16px",
              }}
              onClick={() => window.open(file.url, "_blank")}
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </CardContent>
        </Grid>

        <Grid item xs={3} textAlign="center">
          <IconButton
            onClick={() => togglePlay(index)}
            className="audio-card-play-button"
            style={{
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.1s ease",
              position: "relative",
              top: "-20px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {waveSurferRefs.current[index]?.isPlaying() ? (
              <PauseCircleIcon style={{ fontSize: "40px", color: "#fff" }} />
            ) : (
              <PlayCircleIcon style={{ fontSize: "40px", color: "#1976D2" }} />
            )}
          </IconButton>
        </Grid>
      </Grid>
    </Card>
  );
};

export default AudioCard;
