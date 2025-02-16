import React, { useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import DownloadButton from "../home/audio-card/download-button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import WaveSurfer from "wavesurfer.js";

const LikedAudioCarousel = ({ likedAudioFiles, s3 }) => {
  const theme = useTheme();
  const carouselRef = useRef(null);
  const waveSurferRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);

  if (!likedAudioFiles || likedAudioFiles.length === 0) {
    return (
      <Typography variant="h6" align="center">
        No liked audio files found.
      </Typography>
    );
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
        waveColor: theme.palette.primary.light,
        progressColor: theme.palette.primary.main,
        cursorColor: theme.palette.text.primary,
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
      // Pause any other playing waves
      waveSurferRefs.current.forEach((ws, i) => {
        if (ws && i !== index) ws.pause();
      });
      waveSurferRefs.current[index].play();
      setPlayingIndex(index);
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 4, position: "relative", overflow: "hidden" }}>
      <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 700 }}>
        ❤️ Your Liked Audio Files
      </Typography>

      {/* Scroll Left Button */}
      <IconButton
        onClick={scrollLeft}
        sx={{
          position: "absolute",
          left: 8,
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
          gap: "20px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          px: 4,
          pb: 2,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {likedAudioFiles.map((file, index) => (
          <Card
            key={index}
            sx={{
              minWidth: 220,
              maxWidth: 220,
              height: 200, // Reduced overall card height
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 2,
              boxShadow: 6,
              borderRadius: "16px",
              scrollSnapAlign: "center",
              background:
                "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)",
              position: "relative",
              "&:hover": {
                transform: "scale(1.02)",
                transition: "transform 0.3s ease-in-out",
              },
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {file.name}
              </Typography>

              {/* Waveform container */}
              <Box
                id={`waveform-${index}`}
                sx={{
                  height: "40px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  backgroundColor: "#fff",
                }}
              />
            </CardContent>

            {/* Button Container with reduced top margin */}
            <Box
              sx={{
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={() => togglePlay(index, file.url)}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "#fff",
                  "&:hover": { backgroundColor: theme.palette.primary.dark },
                }}
              >
                {playingIndex === index ? (
                  <PauseIcon fontSize="small" />
                ) : (
                  <PlayArrowIcon fontSize="small" />
                )}
              </IconButton>

              <DownloadButton
                fileUrl={file.url}
                statsKey={`users/${file.uid}/stats/${file.name}.stats.json`}
                s3={s3}
                downloads={file.downloads || 0}
                setDownloads={() => {}}
              />
            </Box>
          </Card>
        ))}
      </Box>

      {/* Scroll Right Button */}
      <IconButton
        onClick={scrollRight}
        sx={{
          position: "absolute",
          right: 8,
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
