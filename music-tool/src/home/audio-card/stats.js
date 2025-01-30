import React from "react";
import { Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const Stats = ({ likes, downloads }) => {
  return (
    <div
      style={{
        position: "absolute",
        right: "200px",
        bottom: "220px",
        display: "flex",
        alignItems: "center",
        gap: "20px", // Space between the icon sets
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px", // Space between the icon and counter
        }}
      >
        <FavoriteIcon style={{ fontSize: "24px" }} />
        <Typography variant="body2" style={{ fontSize: "16px" }}>
          {likes}
        </Typography>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px", // Space between the icon and counter
        }}
      >
        <CloudDownloadIcon style={{ fontSize: "24px" }} />
        <Typography variant="body2" style={{ fontSize: "16px" }}>
          {downloads}
        </Typography>
      </div>
    </div>
  );
};

export default Stats;
