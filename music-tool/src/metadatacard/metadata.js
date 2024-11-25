import React from 'react';
import { Grid, Typography, Button, Box, Card, CardContent } from '@material-ui/core';
// If you're using Material-UI v5, you might need to import from '@mui/material' instead.

const MetadataCard = ({ file }) => {
  return (
    <Card>
      <CardContent>
        {/* Metadata Row with Borders */}
        <Grid container spacing={0} style={{ marginTop: "8px", border: '1px solid #ccc' }}>
          {/* Duration */}
          <Grid item xs={3}>
            <Box
              borderRight={1}
              borderColor="grey.300"
              padding={2}
              display="flex"
              alignItems="center"
              height="100%"
            >
              <Typography variant="body2" color="textSecondary">
                Duration: {file.duration}
              </Typography>
            </Box>
          </Grid>

          {/* Key */}
          <Grid item xs={3}>
            <Box
              borderRight={1}
              borderColor="grey.300"
              padding={2}
              display="flex"
              alignItems="center"
              height="100%"
            >
              <Typography variant="body2" color="textSecondary">
                Key: {file.key}
              </Typography>
            </Box>
          </Grid>

          {/* BPM */}
          <Grid item xs={3}>
            <Box
              borderRight={1}
              borderColor="grey.300"
              padding={2}
              display="flex"
              alignItems="center"
              height="100%"
            >
              <Typography variant="body2" color="textSecondary">
                BPM: {file.bpm}
              </Typography>
            </Box>
          </Grid>

          {/* Genre */}
          <Grid item xs={3}>
            <Box
              padding={2}
              display="flex"
              alignItems="center"
              height="100%"
            >
              <Typography variant="body2" color="textSecondary">
                Genre: {file.genre}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Download Button */}
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.open(file.url, "_blank")}
          >
            Download
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetadataCard;
