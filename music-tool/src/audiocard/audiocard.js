import React from "react";
import { Card, CardContent, Typography, Grid, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import WaveSurfer from "wavesurfer.js";
import "./audiocard.css";

const AudioCard = ({
  file,
  index,
  activeIndexes,
  setActiveIndexes,
  waveSurferRefs,
  onContextMenu,
}) => {
  const initializeWaveSurfer = (url, index) => {
    if (!waveSurferRefs.current[index]) {
      const waveSurfer = WaveSurfer.create({
        container: `#waveform-${index}`,
        waveColor: "#6a11cb",
        progressColor: "#000000",
        cursorColor: "#000000",
        barWidth: 5,
        responsive: true,
        height: 100,
        backend: "MediaElement",
      });

      waveSurfer.load(url);
      waveSurferRefs.current[index] = waveSurfer;

      waveSurfer.on("finish", () => {
        setActiveIndexes((prev) => prev.filter((i) => i !== index));
      });
    }
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
      sx={{ mb: 2 }}
      onMouseEnter={() => initializeWaveSurfer(file.url, index)}
      onContextMenu={onContextMenu}
    >
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={9}>
          <CardContent>
            <Typography variant="h6">{file.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              Publisher: {file.publisher}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Duration: {file.duration}
            </Typography>
            <div id={`waveform-${index}`} className="waveform-container"></div>
          </CardContent>
        </Grid>
        <Grid item xs={3} textAlign="center">
          <IconButton
            onClick={() => togglePlay(index)}
            style={{ color: "black" }}
          >
            {waveSurferRefs.current[index]?.isPlaying() ? <StopIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Grid>
      </Grid>
    </Card>
  );
};

export default AudioCard;
