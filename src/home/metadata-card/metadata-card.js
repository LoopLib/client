import React from "react";
import { Grid, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyIcon from "@mui/icons-material/Key";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import './metadata-card.css';

const Metadata = ({ duration, musicalKey, bpm, genre }) => {
  const boxStyle = {
    border: "1px solid #ccc",
    padding: "4px 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap"
  };

  const iconStyle = { marginRight: "4px" };

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
            {musicalKey}
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
