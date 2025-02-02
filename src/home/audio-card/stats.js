import React from "react";
import { Box, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const Stats = ({ likes, downloads }) => {
  return (
    <Box
      sx={{
        // On small screens, position relative (normal document flow);
        // on medium and larger screens, position absolutely relative to parent.
        position: { xs: "relative", md: "absolute" },
        // Only apply right/bottom offsets on md and up.
        right: { xs: "auto", md: "320px" },
        bottom: { xs: "auto", md: "220px" },
        // Add margin on small screens to avoid edge collisions.
        m: { xs: 2, md: 0 },
        display: "flex",
        alignItems: "center",
        gap: 1, // spacing between stat groups (theme spacing unit)
        p: 1, // padding inside the box
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1, // theme-based border radius
        backgroundColor: "background.paper", // uses the theme's background color
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <FavoriteIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
        <Typography variant="body2" sx={{ fontSize: { xs: "14px", md: "16px" } }}>
          {likes}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CloudDownloadIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
        <Typography variant="body2" sx={{ fontSize: { xs: "14px", md: "16px" } }}>
          {downloads}
        </Typography>
      </Box>
    </Box>
  );
};

export default Stats;
