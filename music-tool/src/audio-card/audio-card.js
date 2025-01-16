import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, Typography, Grid, IconButton, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Metadata from "../metadata-card/metadata-card";
import WaveSurfer from "wavesurfer.js";
import { getAuth } from "firebase/auth";
import axios from "axios";
import AWS from "aws-sdk";
import { getFirestore, query, where, collection, getDocs } from "firebase/firestore";
import "./audio-card.css";
import PlayButton from "./play-button";
import AvatarComponent from "./avatar";
import Stats from "./stats"; // Import the Stats component
import DownloadButton from "./download-button";
import { useLiveKeyDetection } from "./live-key";

const AudioCard = ({ file, index, activeIndexes, setActiveIndexes, waveSurferRefs, onContextMenu, showExtras = true }) => {

  const [duration, setDuration] = useState("N/A");
  const [publisherName, setPublisherName] = useState("");

  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false); // Track if the user has liked the audio
  const [isLoadingUserLiked, setIsLoadingUserLiked] = useState(true);
  const [downloads, setDownloads] = useState(0);

  const { liveKey, liveConfidence, startKeyDetection, stopKeyDetection, handleTimelineSeek } = useLiveKeyDetection(
    waveSurferRefs,
    file.url,
    index
  );

  const isPlaying = waveSurferRefs.current[index]?.isPlaying();

  const intervalRef = useRef(null);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsKey = `users/${file.uid}/stats/${file.name}.stats.json`;
        const statsUrl = s3.getSignedUrl("getObject", {
          Bucket: "looplib-audio-bucket",
          Key: statsKey,
        });

        const response = await axios.get(statsUrl);
        setLikes(response.data.likes || 0);
        setDownloads(response.data.downloads || 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [file.name, file.uid]);

  useEffect(() => {
    const fetchUserLikedStatus = async () => {
      setIsLoadingUserLiked(true); // Start loading
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setUserLiked(false);
          setIsLoadingUserLiked(false); // Done loading
          return;
        }

        const uid = user.uid;
        const statsKey = `users/${file.uid}/stats/${file.name}.stats.json`;

        const statsUrl = s3.getSignedUrl("getObject", {
          Bucket: "looplib-audio-bucket",
          Key: statsKey,
        });

        const response = await axios.get(statsUrl);
        const likedBy = response.data.likedBy || [];

        setUserLiked(likedBy.includes(uid)); // Check if the user has liked the audio
      } catch (error) {
        console.error("Error fetching user like status:", error);
      } finally {
        setIsLoadingUserLiked(false); // Done loading
      }
    };

    fetchUserLikedStatus();
  }, [file.name, file.uid]);

  useEffect(() => {
    initializeWaveSurfer(file.url, index);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const initializeWaveSurfer = (url, index) => {
    const container = document.getElementById(`waveform-${index}`);
    if (!container) return;

    if (!waveSurferRefs.current[index]) {
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

      waveSurfer.on("ready", () => setDuration(formatDuration(waveSurfer.getDuration())));
      waveSurfer.on("play", startKeyDetection);
      waveSurfer.on("pause", stopKeyDetection);

      // Add listener for seek events
      waveSurfer.on("seek", handleTimelineSeek);
      waveSurfer.on("finish", () => {
        stopKeyDetection();
        setActiveIndexes((prev) => prev.filter((i) => i !== index));
      });
    }
  };

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.round(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    // Stop other players and handle current audio play/pause logic
    Object.keys(waveSurferRefs.current).forEach((key) => {
      const i = parseInt(key, 10);
      const waveSurfer = waveSurferRefs.current[i];
      if (waveSurfer && i !== index && waveSurfer.isPlaying()) {
        waveSurfer.pause();
        setActiveIndexes((prev) => prev.filter((activeIndex) => activeIndex !== i));
      }
    });

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


  const handleLike = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to like this audio.");
      return;
    }

    const uid = user.uid;

    try {
      const statsKey = `users/${file.uid}/stats/${file.name}.stats.json`;

      // Fetch existing stats
      const statsUrl = s3.getSignedUrl("getObject", {
        Bucket: "looplib-audio-bucket",
        Key: statsKey,
      });

      const response = await axios.get(statsUrl);
      const currentStats = response.data;
      const likedBy = currentStats.likedBy || [];

      let updatedStats;

      if (likedBy.includes(uid)) {
        // Remove like
        updatedStats = {
          ...currentStats,
          likes: Math.max((currentStats.likes || 1) - 1, 0),
          likedBy: likedBy.filter((id) => id !== uid), // Remove user ID
        };
        setUserLiked(false); // Update UI state
      } else {
        // Add like
        updatedStats = {
          ...currentStats,
          likes: (currentStats.likes || 0) + 1,
          likedBy: [...likedBy, uid], // Add user ID
        };
        setUserLiked(true); // Update UI state
      }

      // Upload updated stats
      await s3
        .upload({
          Bucket: "looplib-audio-bucket",
          Key: statsKey,
          Body: JSON.stringify(updatedStats, null, 2),
          ContentType: "application/json",
        })
        .promise();

      setLikes(updatedStats.likes); // Update likes count
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const updateStats = async (updatedFields) => {
    try {
      const statsKey = `users/${file.uid}/stats/${file.name}.stats.json`;
      const updatedStats = { likes, downloads, ...updatedFields };

      await s3.upload({
        Bucket: "looplib-audio-bucket",
        Key: statsKey,
        Body: JSON.stringify(updatedStats, null, 2),
        ContentType: "application/json",
      }).promise();
    } catch (error) {
      console.error("Error updating stats:", error);
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
      {/* Use AvatarComponent */}
      <AvatarComponent
        publisherName={publisherName}
        profilePicture={file.profilePicture}
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

            <div className="waveform-wrapper">
              {/* Live Key Display */}
              <div className="live-key-display">
                {liveKey !== "N/A" && (
                  <Typography variant="h6" className="live-key-text">
                    🎵 {liveKey} ({liveConfidence}%)
                  </Typography>
                )}
              </div>
              {/* Waveform */}
              <div id={`waveform-${index}`} className="waveform-container"></div>
            </div>


            {/* Pass Duration to Metadata */}
            <Metadata
              duration={duration}
              musicalKey={file.musicalKey}
              bpm={file.bpm}
              genre={file.genre}
            />

            {showExtras && (
              <DownloadButton
                fileUrl={file.url}
                statsKey={`users/${file.uid}/stats/${file.name}.stats.json`}
                s3={s3}
                downloads={downloads}
                setDownloads={setDownloads}
              />
            )}
            <Stats likes={likes} downloads={downloads} /> {/* Use the Stats component */}
            {isLoadingUserLiked ? (
              <IconButton disabled>
                <FavoriteBorderIcon />
              </IconButton>
            ) : (
              <IconButton
                onClick={handleLike}
                color={userLiked ? "error" : "default"} // Red for liked, grey for not liked
                style={{
                  position: "absolute",
                  right: "80px",
                  bottom: "20px",
                  border: "3px solid blue", // Always show the blue border
                  borderRadius: "50%", // Make it a circle
                  padding: "5px", // Add some padding
                }}
              >
                {userLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>

            )}


          </CardContent>
        </Grid>

        <Grid item xs={3} textAlign="center">
          <PlayButton
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            positionStyles={{
              position: "relative",
              width: 65,
              height: 65,
              top: "-5px",
              right: "60px",
            }}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default AudioCard;
