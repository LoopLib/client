import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, Typography, Grid, IconButton, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Metadata from "./metadata-card";
import WaveSurfer from "wavesurfer.js";
import { getAuth } from "firebase/auth";
import { fetchPublisherData, fetchStats, fetchUserLikedStatus } from "./fetch-data"; // Import functions
import PlayButton from "./play-button";
import AvatarComponent from "./avatar";
import Stats from "./stats";
import DownloadButton from "./download-button";
import { useLiveKeyDetection } from "./live-key";
import axios from "axios";
import AWS from "aws-sdk";
import "./audio-card.css";


const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const AudioCard = ({
  file,
  index,
  activeIndexes,
  setActiveIndexes,
  waveSurferRefs,
  onContextMenu,
  showExtras = true,
  showAvatar = true, // Prop to control avatar visibility
  showLikeButton = true, // Prop to control like button visibility
  showStats = true, // Prop to control stats visibility
}) => {
 // State to hold audio duration
 const [duration, setDuration] = useState("N/A");

 // State to hold publisher information
 const [publisherName, setPublisherName] = useState("");

 // State to track likes and whether the current user liked this audio
 const [likes, setLikes] = useState(0);
 const [userLiked, setUserLiked] = useState(false);

 // Loading state for user like check
 const [isLoadingUserLiked, setIsLoadingUserLiked] = useState(true);

 // State to track number of downloads
 const [downloads, setDownloads] = useState(0);

 // Ref to determine if this audio is currently playing
 const isPlaying = waveSurferRefs.current[index]?.isPlaying();

 // Ref to store interval-related logic if needed
 const intervalRef = useRef(null);

 // Destructuring live key detection hooks and handlers
 const {
   liveKey,
   liveConfidence,
   startKeyDetection,
   stopKeyDetection,
   handleTimelineSeek,
 } = useLiveKeyDetection(waveSurferRefs, file.url, index);

 useEffect(() => {
   // Fetch and set publisher's name and profile picture
   const loadPublisherData = async () => {
     const { publisherName, profilePicture } = await fetchPublisherData(file);
     setPublisherName(publisherName);
     file.profilePicture = profilePicture;
   };

   loadPublisherData();
 }, [file.uid]);

 useEffect(() => {
   // Fetch and set initial stats (likes and downloads)
   const loadStats = async () => {
     const { likes, downloads } = await fetchStats(file);
     setLikes(likes);
     setDownloads(downloads);
   };

   loadStats();
 }, [file.uid, file.name]);

 useEffect(() => {
   // Check if the current user has liked this file
   const loadUserLikedStatus = async () => {
     setIsLoadingUserLiked(true);
     const auth = getAuth();
     const user = auth.currentUser;

     if (user) {
       const isLiked = await fetchUserLikedStatus(file, user.uid);
       setUserLiked(isLiked);
     }
     setIsLoadingUserLiked(false);
   };

   loadUserLikedStatus();
 }, [file.uid, file.name]);

 useEffect(() => {
   // Initialize WaveSurfer instance for waveform visualization
   initializeWaveSurfer(file.url, index);
   return () => {
     // Clean up the WaveSurfer instance when component unmounts
     if (waveSurferRefs.current[index]) {
       waveSurferRefs.current[index].destroy();
       waveSurferRefs.current[index] = null;
     }
   };
 }, []);

 // Initialize waveform visualization for audio
 const initializeWaveSurfer = (url, index) => {
   const container = document.getElementById(`waveform-${index}`);
   if (!container || waveSurferRefs.current[index]) return;

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

   // Set duration once waveform is ready
   waveSurfer.on("ready", () => setDuration(formatDuration(waveSurfer.getDuration())));

   // When playback finishes, reset waveform and remove index from active
   waveSurfer.on("finish", () => {
     waveSurfer.seekTo(0);
     setActiveIndexes((prev) => prev.filter((i) => i !== index));
     stopKeyDetection(index);
   });
 };

 // Utility function to format audio duration to MM:SS
 const formatDuration = (durationInSeconds) => {
   const minutes = Math.floor(durationInSeconds / 60);
   const seconds = Math.round(durationInSeconds % 60);
   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
 };

 // Toggle audio playback and handle active index state
 const togglePlay = () => {
   // Pause other playing waveforms
   Object.keys(waveSurferRefs.current).forEach((key) => {
     const i = parseInt(key, 10);
     const waveSurfer = waveSurferRefs.current[i];
     if (waveSurfer && i !== index && waveSurfer.isPlaying()) {
       waveSurfer.pause();
       setActiveIndexes((prev) => prev.filter((activeIndex) => activeIndex !== i));
       stopKeyDetection(i);
     }
   });

   const waveSurfer = waveSurferRefs.current[index];
   if (waveSurfer) {
     if (waveSurfer.isPlaying()) {
       // Pause current audio and stop key detection
       waveSurfer.pause();
       setActiveIndexes((prev) => prev.filter((i) => i !== index));
       stopKeyDetection(index);
     } else {
       // Play audio and start key detection
       waveSurfer.play();
       setActiveIndexes((prev) => [...prev, index]);
       startKeyDetection(index);
     }
   }
 };

 // Handle like and unlike functionality
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

     // Generate signed URL to fetch stats JSON
     const statsUrl = s3.getSignedUrl("getObject", {
       Bucket: "looplib-audio-bucket",
       Key: statsKey,
     });

     const response = await axios.get(statsUrl);
     const currentStats = response.data;
     const likedBy = currentStats.likedBy || [];

     let updatedStats;

     if (likedBy.includes(uid)) {
       // Unlike the audio: remove user from likedBy list
       updatedStats = {
         ...currentStats,
         likes: Math.max((currentStats.likes || 1) - 1, 0),
         likedBy: likedBy.filter((id) => id !== uid),
       };
       setUserLiked(false);
     } else {
       // Like the audio: add user to likedBy list
       updatedStats = {
         ...currentStats,
         likes: (currentStats.likes || 0) + 1,
         likedBy: [...likedBy, uid],
       };
       setUserLiked(true);
     }

     // Upload updated stats back to S3
     await s3
       .upload({
         Bucket: "looplib-audio-bucket",
         Key: statsKey,
         Body: JSON.stringify(updatedStats, null, 2),
         ContentType: "application/json",
       })
       .promise();

     // Update local like count
     setLikes(updatedStats.likes);
   } catch (error) {
     console.error("Error updating like:", error);
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
      {/* Conditionally Render Avatar */}
      {showAvatar && (
        <AvatarComponent
          publisherName={publisherName}
          profilePicture={file.profilePicture}
        />
      )}


      <Grid container spacing={2} alignItems="center">
        <Grid item xs={9}>
          <CardContent>

            <Typography
              variant="h6"
              className="audio-card-title font-semibold text-lg truncate"
              title={file.name} // Tooltip for truncated names
            >
              {file.name}
            </Typography>

            {showExtras && (
              <Typography
                variant="body2"
                className="audio-card-publisher text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                onClick={() => window.location.assign(`/user-library/${file.uid}`)}
                title={`Publisher: ${publisherName}`}
              >
                Publisher: {publisherName}
              </Typography>
            )}

            <div className="waveform-wrapper" style={{ position: "relative" }}>
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
              {/* Conditionally Render Stats */}
              {showStats && <Stats likes={likes} downloads={downloads} />}
            </div>

            <Metadata
              duration={duration}
              musicalKey={file.musicalKey}
              bpm={file.bpm}
              genre={file.genre}
              instrument={file.instrument}
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


            {/* Conditionally Render Like Button */}
            {showLikeButton && (
              <IconButton
                onClick={handleLike}
                color={userLiked ? "error" : "default"} // Red for liked, grey for not liked
                style={{
                  position: "absolute",
                  right: "80px",
                  bottom: "20px",
                  border: "3px solid #333", // Always show the blue border
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
              right: "30px",
            }}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default AudioCard;
