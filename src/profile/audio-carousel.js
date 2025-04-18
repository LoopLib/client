import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DownloadButton from "../home/audio-card/download-button";
import WaveSurfer from "wavesurfer.js";

const LikedAudioCarousel = ({ likedAudioFiles, s3 }) => {
  // Reference to the carousel container
  const carouselRef = useRef(null);
  // Array of WaveSurfer instances for each audio file
  const waveSurferRefs = useRef([]);
  // Track which audio is currently playing
  const [playingIndex, setPlayingIndex] = useState(null);
  // Track if user can scroll carousel to the left
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  // Track if user can scroll carousel to the right
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Effect to handle scroll buttons state (left/right scroll availability)
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        // Update scroll state based on current scroll position
        setCanScrollLeft(carouselRef.current.scrollLeft > 0);
        setCanScrollRight(
          carouselRef.current.scrollLeft <
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth
        );
      }
    };

    const ref = carouselRef.current;
    if (ref) {
      // Attach scroll listener when component mounts
      ref.addEventListener("scroll", handleScroll);
      // Call immediately to set initial state
      handleScroll();
    }

    // Cleanup: remove event listener when component unmounts
    return () => ref && ref.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to initialize WaveSurfer instances when likedAudioFiles changes
  useEffect(() => {
    likedAudioFiles.forEach((file, index) => {
      // Only create a new instance if it doesn't already exist
      if (!waveSurferRefs.current[index]) {
        waveSurferRefs.current[index] = WaveSurfer.create({
          container: `#waveform-${index}`, // Container for waveform
          waveColor: "#6a11cb",            // Wave color
          progressColor: "#000000",        // Played portion color
          cursorColor: "#000000",          // Playback cursor color
          barWidth: 2,                     // Width of waveform bars
          height: 40,                      // Height of waveform
          responsive: true,                // Adjust to container size
          backend: "MediaElement",         // Use HTML5 audio backend
        });

        // Load the audio file into the waveform
        waveSurferRefs.current[index].load(file.url);
      }
    });

    // Cleanup: destroy all WaveSurfer instances when component unmounts or files change
    return () => {
      waveSurferRefs.current.forEach((ws) => ws && ws.destroy());
      waveSurferRefs.current = [];
    };
  }, [likedAudioFiles]);

  // Function to toggle play/pause for a specific audio file
  const togglePlay = (index) => {
    if (!waveSurferRefs.current[index]) return;

    if (playingIndex === index) {
      // Pause if currently playing
      waveSurferRefs.current[index].pause();
      setPlayingIndex(null);
    } else {
      // Pause any other playing audio
      waveSurferRefs.current.forEach((ws, i) => {
        if (ws && i !== index) ws.pause();
      });

      // Play the selected audio and update playing index
      waveSurferRefs.current[index].play();
      setPlayingIndex(index);
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 4, position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Poppins', sans-serif", // Modern font
          fontWeight: 600,
          color: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          letterSpacing: 1,
        }}
      >
        ❤️ Your Liked Audio Files
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "900px", position: "relative" }}>

        {/* Scroll Left Button */}
        <IconButton
          onClick={() => carouselRef.current?.scrollBy({ left: -250, behavior: "smooth" })}
          disabled={!canScrollLeft}
          sx={{
            position: "absolute",
            left: "0px",
            top: "-10%",
            transform: "translateY(-50%)",
            background: "rgba(255, 255, 255, 0.6)",
            color: "#333",
            border: "3px solid #333",
            zIndex: 2,
            opacity: canScrollLeft ? 1 : 0.5,
            pointerEvents: canScrollLeft ? "auto" : "none",
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        {/* Horizontal Scrollable Container */}
        <Box
          ref={carouselRef}
          sx={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            scrollSnapType: "x mandatory",
            padding: "10px",
            width: "100%",
            maxWidth: "900px",
            justifyContent: "center",
            "&::-webkit-scrollbar": { display: "none" },
            scrollPaddingLeft: "10px",
          }}
        >
          {likedAudioFiles.map((file, index) => (
            <Card
              key={index}
              sx={{
                flex: "0 0 calc(20% - 10px)", // Display 5 items at a time
                maxWidth: "160px",
                height: "160px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textAlign: "center",
                padding: "10px",
                boxShadow: 3,
                border: "3px solid #ddd",
                borderRadius: "12px",
                scrollSnapAlign: "start",
                backgroundColor: "#ffffff",
                position: "relative",
              }}
            >
              <CardContent sx={{ padding: "10px" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: 600,
                  }}
                >
                  {file.name}
                </Typography>

                {/* Waveform */}
                <Box
                  id={`waveform-${index}`}
                  sx={{
                    height: "40px",
                    marginTop: "8px",
                    backgroundColor: "#ddd",
                    borderRadius: "4px",
                  }}
                />

                {/* Buttons */}
                <Box sx={{ display: "flex", justifyContent: "start", gap: "8px", mt: 4 }}>
                  <IconButton
                    onClick={() => togglePlay(index)}
                    sx={{
                      backgroundColor: "#6a11cb",
                      color: "#fff",
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    {playingIndex === index ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                  </IconButton>

                  <DownloadButton
                    fileUrl={file.url}
                    statsKey={`users/${file.uid}/stats/${file.name}.stats.json`}
                    s3={s3}
                    downloads={file.downloads || 0}
                    setDownloads={() => { }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Scroll Right Button */}
        <IconButton
          onClick={() => carouselRef.current?.scrollBy({ left: 250, behavior: "smooth" })}
          disabled={!canScrollRight}
          sx={{
            position: "absolute",
            right: "0px",
            top: "-10%",
            transform: "translateY(-50%)",
            background: "rgba(255, 255, 255, 0.6)",
            color: "#333",
            border: "3px solid #333",
            zIndex: 2,
            opacity: canScrollRight ? 1 : 0.5,
            pointerEvents: canScrollRight ? "auto" : "none",
          }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default LikedAudioCarousel;
