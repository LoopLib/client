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
  const carouselRef = useRef(null);
  const waveSurferRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        setCanScrollLeft(carouselRef.current.scrollLeft > 0);
        setCanScrollRight(
          carouselRef.current.scrollLeft <
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth
        );
      }
    };

    const ref = carouselRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => ref && ref.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    likedAudioFiles.forEach((file, index) => {
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
        waveSurferRefs.current[index].load(file.url);
      }
    });

    return () => {
      waveSurferRefs.current.forEach((ws) => ws && ws.destroy());
      waveSurferRefs.current = [];
    };
  }, [likedAudioFiles]);

  const togglePlay = (index) => {
    if (!waveSurferRefs.current[index]) return;

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
