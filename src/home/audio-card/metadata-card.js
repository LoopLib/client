import React from "react";
import { Grid, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyIcon from "@mui/icons-material/Key";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";


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

const Metadata = ({ duration, musicalKey, bpm, genre }) => {
  const boxStyle = {
    border: "3px solid #ccc",
    borderRadius: "10px",
    padding: "4px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap"
  };

  const iconStyle = { marginRight: "4px", fontSize: "1.5rem" };

  return (
    <Grid container spacing={1} style={{ marginTop: "4px" }}>
      <Grid item xs={3}>
        <div className="metadata-box" style={boxStyle}>
          <AccessTimeIcon fontSize="small" style={iconStyle} />
          <Typography variant="caption" color="textSecondary">
            {duration}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className="metadata-box" style={boxStyle}>
          <KeyIcon fontSize="small" style={iconStyle} />
          <Typography variant="caption" color="textSecondary">
            {formatMusicalKey(musicalKey)}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className="metadata-box" style={boxStyle}>
          <EqualizerIcon fontSize="small" style={iconStyle} />
          <Typography variant="caption" color="textSecondary">
            {bpm} BPM
          </Typography>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className="metadata-box" style={boxStyle}>
          <LibraryMusicIcon fontSize="small" style={iconStyle} />
          <Typography variant="caption" color="textSecondary">
            {genre}
          </Typography>
        </div>
      </Grid>
    </Grid>
  );
};


export default Metadata;
