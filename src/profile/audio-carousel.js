import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DownloadButton from "../home/audio-card/download-button";
import WaveSurfer from "wavesurfer.js";

const LikedAudioCarousel = ({ likedAudioFiles, s3 }) => {
  const carouselRef = useRef(null);
  const waveSurferRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);

  if (!likedAudioFiles || likedAudioFiles.length === 0) {
    return <Typography variant="h6" align="center">No liked audio files found.</Typography>;
  }

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const togglePlay = (index, fileUrl) => {
    if (!waveSurferRefs.current[index]) {
      waveSurferRefs.current[index] = WaveSurfer.create({
        container: `#waveform-${index}`,
        waveColor: "#6a11cb",
        progressColor: "#000000",
        cursorColor: "#000000",
        barWidth: 2,
        height: 40,
        responsive: true,
        backend: "MediaElement",
      });
      waveSurferRefs.current[index].load(fileUrl);
    }

    if (playingIndex === index) {
      waveSurferRefs.current[index].pause();
      setPlayingIndex(null);
    } else {
      waveSurferRefs.current.forEach((ws, i) => {
        if (ws && i !== index) ws.pause();
      });
      waveSurferRefs.current[index].play();
      setPlayingIndex(index);
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 4, position: "relative", overflow: "hidden" }}>
      <Typography variant="h5" align="center" sx={{ mb: 2 }}>
        ❤️ Your Liked Audio Files
      </Typography>

      {/* Scroll Left Button */}
      <IconButton
        onClick={scrollLeft}
        sx={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "#fff",
          zIndex: 2,
          "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
        }}
      >
        ◀
      </IconButton>

      {/* Horizontal Scrollable Container */}
      <Box
        ref={carouselRef}
        sx={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollSnapType: "x mandatory",
          paddingBottom: "10px",
          paddingLeft: "20px",
          paddingRight: "20px",
          "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar for better UX
        }}
      >
        {likedAudioFiles.map((file, index) => (
          <Card
            key={index}
            sx={{
              minWidth: "180px",
              maxWidth: "180px",
              height: "160px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
              padding: "10px",
              boxShadow: 3,
              borderRadius: "12px",
              scrollSnapAlign: "start",
              backgroundColor: "#f9f9f9",
              position: "relative",
            }}
          >
            <CardContent sx={{ padding: "10px" }}>
              <Typography variant="subtitle2" sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: 600
              }}>
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
              <Box sx={{ display: "flex", justifyContent: "center", gap: "8px", mt: 1 }}>
                <IconButton
                  onClick={() => togglePlay(index, file.url)}
                  sx={{
                    backgroundColor: "#6a11cb",
                    color: "#fff",
                    width: "30px",
                    height: "30px",
                    "&:hover": { backgroundColor: "#4c0cb1" },
                  }}
                >
                  {playingIndex === index ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                </IconButton>

                <DownloadButton
                  fileUrl={file.url}
                  statsKey={`users/${file.uid}/stats/${file.name}.stats.json`}
                  s3={s3}
                  downloads={file.downloads || 0}
                  setDownloads={() => {}}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Scroll Right Button */}
      <IconButton
        onClick={scrollRight}
        sx={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "#fff",
          zIndex: 2,
          "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
        }}
      >
        ▶
      </IconButton>
    </Box>
  );
};

export default LikedAudioCarousel;
