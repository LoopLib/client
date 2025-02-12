import React from "react";
import { Box, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const Stats = ({ likes, downloads }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        transform: "translateY(-100%)", // positions it just above the container
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1,
      }}
    >
      <FavoriteIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
      <Typography variant="body2" sx={{ fontSize: { xs: "16px", md: "16px" } }}>
        {likes}
      </Typography>
      <CloudDownloadIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
      <Typography variant="body2" sx={{ fontSize: { xs: "16px", md: "16px" } }}>
        {downloads}
      </Typography>
    </Box>

  );
};

export default Stats;
