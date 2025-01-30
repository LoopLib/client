import React from "react";
import { IconButton } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";

const PlayButton = ({ isPlaying, togglePlay, positionStyles }) => {
  return (
    <IconButton
      onClick={togglePlay}
      className="audio-card-play-button"
      style={{
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.1s ease",
        ...positionStyles, // Maintain the position styles
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {isPlaying ? (
        <PauseCircleIcon style={{ fontSize: "60px", color: "#fff" }} />
      ) : (
        <PlayCircleIcon style={{ fontSize: "60px", color: "#1976D2" }} />
      )}
    </IconButton>
  );
};

export default PlayButton;
