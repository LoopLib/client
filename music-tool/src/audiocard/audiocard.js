import React from "react";
import { Card, CardContent, Typography, Grid, IconButton, Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import WaveSurfer from "wavesurfer.js";
import DownloadIcon from "@mui/icons-material/Download";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { Avatar } from "@mui/material";
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
            backend: "MediaElement", // Use "WebAudio" if waveform extraction fails
        });

        waveSurfer.load(url);
        waveSurferRefs.current[index] = waveSurfer;

        waveSurfer.on("ready", async () => {
            try {
                const peaks = waveSurfer.backend.getPeaks(512); // Extract waveform peaks
                console.log("Waveform Peaks:", peaks);

                // Call function to upload waveform data
                await uploadWaveformData(peaks, selectedFile.name);
            } catch (error) {
                console.error("Error extracting waveform peaks:", error);
            }
        });

        waveSurfer.on("finish", () => {
            setActiveIndexes((prev) => prev.filter((i) => i !== index));
        });
    }
};
const uploadWaveformData = async (peaks, fileName) => {
  try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
          throw new Error("User not authenticated");
      }

      const uid = user.uid;

      const s3 = new AWS.S3({
          region: process.env.REACT_APP_AWS_REGION,
          accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      });

      const waveformData = {
          peaks,
          fileName,
          timestamp: new Date().toISOString(),
      };

      const params = {
          Bucket: "looplib-audio-bucket",
          Key: `users/${uid}/${fileName}.waveform.json`,
          Body: JSON.stringify(waveformData),
          ContentType: "application/json",
      };

      const uploadResult = await s3.upload(params).promise();
      console.log("Waveform data uploaded successfully:", uploadResult);
  } catch (error) {
      console.error("Error uploading waveform data:", error);
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
      className={`audio-card ${activeIndexes.includes(index) ? 'active' : ''}`}
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

      {/* Add this Avatar component */}
      <Avatar
        alt={file.publisher}
        src={file.profilePicture} // Keep the profile picture
        sx={{
          position: "absolute",
          top: 8,
          right: 20, // Positioned in the top-right corner
          width: 50, // Larger size
          height: 50, // Larger size
          border: "3px solid", // Add a border
          borderColor: "primary.main", // Border matches primary color
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Add shadow for emphasis
        }}
      />


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
                <div className="metadata-box" style={{ border: "1px solid black", padding: "8px" }}>
                  <Typography variant="body2" color="textSecondary">
                    Duration: {file.duration}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="metadata-box" style={{ border: "1px solid black", padding: "8px" }}>
                  <Typography variant="body2" color="textSecondary">
                    Key: Cmin{file.key}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="metadata-box" style={{ border: "1px solid black", padding: "8px" }}>
                  <Typography variant="body2" color="textSecondary">
                    BPM: 135.00{file.bpm}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="metadata-box" style={{ border: "1px solid black", padding: "8px" }}>
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
            style={{
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.1s ease',
              position: 'relative',
              top: '-20px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')} // Scale up on hover
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')} // Reset scale
          >
            {waveSurferRefs.current[index]?.isPlaying() ? (
              <PauseCircleIcon style={{ fontSize: '40px', color: '#fff' }} /> // Pause Icon
            ) : (
              <PlayCircleIcon style={{ fontSize: '40px', color: '#2575fc' }} />  // Play Icon
            )}
          </IconButton>

        </Grid>
      </Grid>
    </Card>
  );
};

export default AudioCard;
