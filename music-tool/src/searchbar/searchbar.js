import React, { useState } from "react";
import {
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Card,
} from "@mui/material";
import "./searchbar.css";

const SearchBar = ({ onSearchChange }) => {
  const [genre, setGenre] = useState("");
  const [key, setKey] = useState("");
  const [bpm, setBpm] = useState("");
  const [publishedDate, setPublishedDate] = useState("");

  const handleGenreChange = (event) => setGenre(event.target.value);
  const handleKeyChange = (event) => setKey(event.target.value);
  const handleBpmChange = (event) => setBpm(event.target.value);
  const handleSearchClick = () => {
    console.log("Filters Applied:", { genre, key, bpm, publishedDate });
  };

  return (
    <Box className="search-bar-container">
      {/* Search Input */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for audio files..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-bar-input"
      />

      {/* Filters */}
      <Card className="filters-card" elevation={3}>
        <Box className="filters-container">
          {/* Published Date */}
          <TextField
            type="date"
            label="Published Date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className="filter-item"
          />

          {/* Genre */}
          <FormControl className="filter-item">
            <InputLabel shrink>Genre</InputLabel>
            <Select
              value={genre}
              onChange={handleGenreChange}
              variant="outlined"
              className="filter-select"
            >
              <MenuItem value="pop">Pop</MenuItem>
              <MenuItem value="rock">Rock</MenuItem>
              <MenuItem value="hip-hop">Hip-Hop</MenuItem>
              <MenuItem value="electronic">Electronic</MenuItem>
              <MenuItem value="jazz">Jazz</MenuItem>
            </Select>
          </FormControl>

          {/* Key */}
          <FormControl className="filter-item">
            <InputLabel shrink>Key</InputLabel>
            <Select
              value={key}
              onChange={handleKeyChange}
              variant="outlined"
              className="filter-select"
            >
              {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((note) => (
                <MenuItem key={note} value={note}>
                  {note}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* BPM */}
          <TextField
            type="number"
            label="BPM"
            value={bpm}
            onChange={handleBpmChange}
            placeholder="Enter BPM"
            InputLabelProps={{ shrink: true }}
            className="filter-item"
          />

          {/* Apply Filters Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
            className="filter-button"
          >
            Apply Filters
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default SearchBar;
