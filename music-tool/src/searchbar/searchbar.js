// SearchBar.js
import React from "react";
import { TextField, Box } from "@mui/material";

const SearchBar = ({ onSearchChange }) => {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for audio files..."
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />
    </Box>
  );
};

export default SearchBar;
