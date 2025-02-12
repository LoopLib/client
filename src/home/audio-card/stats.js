import React from "react";
import { Box, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const Stats = ({ likes, downloads }) => {
  return (
    <Box
      sx={{
        display: "flex",
        position: "absolute",
        top: '60px',
        right: '330px',
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
