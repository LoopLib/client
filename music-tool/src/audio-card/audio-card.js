import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, IconButton, Button } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import DownloadIcon from "@mui/icons-material/Download";
import { Avatar } from "@mui/material";
import Metadata from "../metadata-card/metadata-card";
import WaveSurfer from "wavesurfer.js";
import AWS from "aws-sdk";
import { getFirestore, query, where, collection, getDocs } from "firebase/firestore";
import "./audio-card.css";

const AudioCard = ({
  file,
  index,
  activeIndexes,
  setActiveIndexes,
  waveSurferRefs,
  onContextMenu,
  showExtras = true, // Default to true
}) => {

  const [duration, setDuration] = useState("N/A");
  const [publisherName, setPublisherName] = useState("");

  // AWS S3 configuration
  const s3 = new AWS.S3({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION,
  });

  useEffect(() => {
    const fetchPublisherData = async () => {
      try {
        if (!file.uid) {
          console.error("Error: file.uid is undefined");
          setPublisherName("Unknown");
          return;
        }

        const db = getFirestore();
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("uid", "==", file.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setPublisherName(userData.username || "Unknown");

          // Construct profile picture URL from S3
          const avatarKey = `users/${file.uid}/avatar/profile-picture.jpg`;
          const avatarUrl = s3.getSignedUrl("getObject", {
            Bucket: "looplib-audio-bucket",
            Key: avatarKey,
          });

          // Dynamically update file with the profile picture URL
          file.profilePicture = avatarUrl;
        } else {
          console.error("No matching Firestore document found for UID:", file.uid);
          setPublisherName("Unknown");
        }
      } catch (error) {
        console.error("Error fetching publisher data:", error);
        setPublisherName("Unknown");
      }
    };

    fetchPublisherData();
  }, [file.uid]);

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
        alt={publisherName}
        src={file.profilePicture || "/default-avatar.png"}
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

            <Typography
              variant="p"
              className="audio-card-title"
              title={file.name} // Tooltip for truncated names
            >
              {file.name}
            </Typography>


            <Typography
              variant="p"
              className="audio-card-publisher"
              onClick={() => showExtras && window.location.assign(`/user-library/${file.uid}`)}
              title={showExtras ? `Publisher: ${publisherName}` : ""}
            >
              {showExtras && `Publisher: ${publisherName}`}
            </Typography>

            <div id={`waveform-${index}`} className="waveform-container"></div>

            {/* Pass Duration to Metadata */}
            <Metadata
              duration={duration}
              musicalKey={file.musicalKey}
              bpm={file.bpm}
              genre={file.genre}
            />

            {showExtras && (
              <Button
                variant="contained"
                color="primary"
                style={{
                  position: "absolute",
                  right: "20px",
                  bottom: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40px", // Set width for a square button
                  height: "40px", // Set height for a square button
                  padding: 0, // Remove default padding
                  minWidth: "unset", // Prevent Material-UI from enforcing min-width
                }}
                onClick={() => window.open(file.url, "_blank")}
              >
                <DownloadIcon />
              </Button>
            )}
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
