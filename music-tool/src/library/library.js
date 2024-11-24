import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  List,
  Grid,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import AWS from "aws-sdk";
import WaveSurfer from "wavesurfer.js";
import "./library.css";

const Library = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const waveSurferRefs = useRef({});
  const [activeIndex, setActiveIndex] = useState(null);

  const [contextMenu, setContextMenu] = useState(null); // Context menu position and target
  const [selectedFile, setSelectedFile] = useState(null); // The file associated with the context menu

  useEffect(() => {
    fetchAudioFilesFromAWS();
    return () => {
      Object.values(waveSurferRefs.current).forEach((waveSurfer) => waveSurfer.destroy());
    };
  }, []);

  const fetchAudioFilesFromAWS = async () => {
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      const params = { Bucket: "looplib-audio-bucket" };
      const data = await s3.listObjectsV2(params).promise();

      // Create initial file list without duration
      const files = data.Contents.map((file) => ({
        name: file.Key.split("/").pop(),
        url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${file.Key}`,
        publisher: "Anonymous Publisher", // Placeholder
        duration: null, // Will fetch later
      }));

      setAudioFiles(files);

      // Fetch durations in the background
      for (let i = 0; i < files.length; i++) {
        const audio = new Audio(files[i].url);
        audio.addEventListener("loadedmetadata", () => {
          setAudioFiles((prev) =>
            prev.map((item, index) =>
              index === i ? { ...item, duration: formatDuration(audio.duration) } : item
            )
          );
        });
      }
    } catch (error) {
      console.error("Error fetching audio files from AWS:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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
        setActiveIndex(null);
      });
    }
  };

  const togglePlay = (index) => {
    const waveSurfer = waveSurferRefs.current[index];
    if (waveSurfer) {
      if (waveSurfer.isPlaying()) {
        waveSurfer.pause();
        setActiveIndex(null);
      } else {
        waveSurfer.play();
        setActiveIndex(index);
      }
    }
  };

  // Handle right-click event
  const handleRightClick = (event, file) => {
    event.preventDefault();
    setSelectedFile(file);
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu(null);
    setSelectedFile(null);
  };

  const handleOptionSelect = (option) => {
    if (option === "play") {
      const index = audioFiles.indexOf(selectedFile);
      togglePlay(index);
    } else if (option === "edit") {
      alert(`Editing ${selectedFile.name}`);
      // Add edit functionality here
    } else if (option === "delete") {
      alert(`Deleting ${selectedFile.name}`);
      // Add delete functionality here
    }
    closeContextMenu();
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box className="all-audio-container">
      <Typography variant="h4" className="all-audio-title" mb={4}>
        All Audio Tracks
      </Typography>
      <List>
        {audioFiles.length > 0 ? (
          audioFiles.map((file, index) => (
            <Card
              key={index}
              className={`audio-card ${activeIndex === index ? "active" : ""}`}
              sx={{ mb: 2 }}
              onMouseEnter={() => initializeWaveSurfer(file.url, index)}
              onContextMenu={(event) => handleRightClick(event, file)} // Right-click handler
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
                    {waveSurferRefs.current[index]?.isPlaying() ? (
                      <StopIcon />
                    ) : (
                      <PlayArrowIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No audio files available.
          </Typography>
        )}
      </List>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleOptionSelect("play")}>
          {activeIndex === audioFiles.indexOf(selectedFile) ? "Pause" : "Play"}
        </MenuItem>
        <MenuItem onClick={() => handleOptionSelect("edit")}>Edit</MenuItem>
        <MenuItem onClick={() => handleOptionSelect("delete")}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default Library;
