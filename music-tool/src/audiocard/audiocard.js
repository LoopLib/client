import React from "react";
import { Card, CardContent, Typography, Grid, IconButton, Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import WaveSurfer from "wavesurfer.js";
import DownloadIcon from "@mui/icons-material/Download";
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
        backend: "MediaElement", // Try "WebAudio" if this doesn't work
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
      sx={{ mb: 2, borderRadius: 4, position: "relative" }} // Add 'position: "relative"' here
      onMouseEnter={() => initializeWaveSurfer(file.url, index)}
      onContextMenu={onContextMenu}
    >

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={9}>
          <CardContent>
            {/* Name and Publisher Above Waveform */}
            <Typography variant="body2" gutterBottom>
              {file.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Publisher: {file.publisher}
            </Typography>

            {/* Waveform */}
            <div id={`waveform-${index}`} className="waveform-container"></div>

            {/* Metadata and Download Button Below Waveform */}
            <Grid container spacing={2} style={{ marginTop: "8px" }}>
              <Grid item xs={3}>
                <div className="metadata-box">
                  <Typography variant="body2" color="textSecondary">
                    Duration: {file.duration}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="metadata-box">
                  <Typography variant="body2" color="textSecondary">
                    Key: Cmin{file.key}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="metadata-box">
                  <Typography variant="body2" color="textSecondary">
                    BPM: 135.00{file.bpm}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="metadata-box">
                  <Typography variant="body2" color="textSecondary">
                    Genre: House{file.genre}
                  </Typography>
                </div>
              </Grid>
            </Grid>
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
          >
            {waveSurferRefs.current[index]?.isPlaying() ? (
              <StopIcon />
            ) : (
              <PlayArrowIcon />
            )}
          </IconButton>
        </Grid>
      </Grid>
    </Card>
  );
};

export default AudioCard;
