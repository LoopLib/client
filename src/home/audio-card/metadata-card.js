import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyIcon from "@mui/icons-material/Key";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const formatMusicalKey = (key) => {
  if (!key) return key;
  const lowerKey = key.toLowerCase();
  if (lowerKey.endsWith("min")) {
    return key.slice(0, key.length - 3) + " min";
  } else if (lowerKey.endsWith("maj")) {
    return key.slice(0, key.length - 3) + " maj";
  }
  return key;
};

const Metadata = ({ duration, musicalKey, bpm, genre, instrument }) => {
  const boxStyle = {
    border: "2px solid #ccc",
    borderRadius: "10px",
    padding: "4px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0, // Prevents text overflow
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: "1 1 auto", // Ensures flexible width for responsiveness
  };

  const iconStyle = { marginRight: "6px", fontSize: "1.5rem" };

  return (
    <Grid
      container
      spacing={1}
      sx={{
        display: "flex",
        flexWrap: "wrap", // Ensures wrapping if necessary
        justifyContent: "space-between",
      }}
    >
      {[{ icon: <AccessTimeIcon />, text: duration },
        { icon: <KeyIcon />, text: formatMusicalKey(musicalKey) },
        { icon: <EqualizerIcon />, text: `${bpm} BPM` },
        { icon: <LibraryMusicIcon />, text: genre },
        { icon: <MusicNoteIcon />, text: instrument }]
        .map((item, index) => (
          <Grid item xs={12 / 5} key={index} sx={{ display: "flex", flexGrow: 1, minWidth: 0 }}>
            <Box sx={boxStyle}>
              {React.cloneElement(item.icon, { fontSize: "small", style: iconStyle })}
              <Typography variant="caption" color="textSecondary" noWrap>
                {item.text}
              </Typography>
            </Box>
          </Grid>
        ))}
    </Grid>
  );
};

export default Metadata;
