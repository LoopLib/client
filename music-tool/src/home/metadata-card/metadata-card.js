import React from "react";
import { Grid, Typography } from "@mui/material";
import './metadata-card.css'

const Metadata = ({ duration, musicalKey, bpm, genre }) => {
  return (
    <Grid container spacing={2} style={{ marginTop: "8px" }}>
      <Grid item xs={3}>
        <div className="metadata-box" style={{ border: "1px solid black", padding: "8px" }}>
          <Typography variant="body2" color="textSecondary">
            Duration: {duration}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className="metadata-box" style={{ border: "1px solid black", padding: "8px" }}>
          <Typography variant="body2" color="textSecondary">
            Key: {musicalKey}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className="metadata-box" style={{ border: "1px solid black", padding: "8px" }}>
          <Typography variant="body2" color="textSecondary">
            BPM: {bpm}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className="metadata-box" style={{ border: "1px solid black", padding: "8px" }}>
          <Typography variant="body2" color="textSecondary">
            Genre: {genre}
          </Typography>
        </div>
      </Grid>
    </Grid>
  );
};

export default Metadata;
