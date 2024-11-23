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
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import AWS from "aws-sdk";
import WaveSurfer from "wavesurfer.js";
import "./library.css"; // For consistent styling

const Library = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const waveSurferRefs = useRef({});
  const [activeIndex, setActiveIndex] = useState(null);

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

      const params = {
        Bucket: "looplib-audio-bucket",
      };

      const data = await s3.listObjectsV2(params).promise();
      const files = data.Contents.map((file) => ({
        name: file.Key.split("/").pop(),
        url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${file.Key}`,
      }));

      setAudioFiles(files);
    } catch (error) {
      console.error("Error fetching audio files from AWS:", error.message);
    } finally {
      setLoading(false);
    }
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
            >
              <Grid container alignItems="center">
                <Grid item xs={8}>
                  <CardContent>
                    <Typography>{file.name}</Typography>
                    <div id={`waveform-${index}`} className="waveform-container"></div>
                  </CardContent>
                </Grid>
                <Grid item xs={3}>
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
    </Box>
  );
};

export default Library;
