import React, { useState } from "react";
// Importing Material UI components for form elements and layout
import {
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Card,
  InputAdornment,
} from "@mui/material";
// Importing search icon from MUI Icons
import SearchIcon from "@mui/icons-material/Search";
// Importing custom CSS for the search bar
import "./searchbar.css";

// Main SearchBar component that takes props for search handling and dropdown options
const SearchBar = ({ onSearchChange, instrumentOptions, genreOptions }) => {
  // State hooks for managing each filter and search input
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [mode, setMode] = useState("");
  const [key, setKey] = useState("");
  const [instrument, setInstrument] = useState("");
  const [bpmRange, setBpmRange] = useState({ min: "", max: "" });
  const [timeRange, setTimeRange] = useState("");
  const [sortOption, setSortOption] = useState("");

  // Handlers for filter changes
  const handleGenreChange = (event) => setGenre(event.target.value);

  // Reset key when mode is changed
  const handleModeChange = (event) => {
    setMode(event.target.value);
    setKey(""); // Reset key selection when mode changes
  };

  const handleKeyChange = (event) => setKey(event.target.value);

  // Update either min or max BPM while keeping the other
  const handleBpmRangeChange = (event) => {
    const { name, value } = event.target;
    setBpmRange((prevRange) => ({ ...prevRange, [name]: value }));
  };

  // Handle instrument change and trigger search update immediately
  const handleInstrumentChange = (event) => {
    const newInstrument = event.target.value;
    setInstrument(newInstrument);
    onSearchChange({
      query,
      genre,
      mode,
      key,
      bpmRange,
      timeRange,
      sortOption,
      instrument: newInstrument,
    });
  };

  // Trigger full search when search button is clicked
  const handleSearchClick = () => {
    onSearchChange({
      query,
      genre,
      mode,
      key,
      bpmRange,
      timeRange,
      sortOption,
      instrument,
    });
    // Log current filter values
    console.log("Filters Applied:", { query, genre, mode, key, bpmRange, timeRange, sortOption, instrument });
  };

  // Array of musical key options for dropdown
  const keyOptions = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  return (
    <Box className="search-bar-container">
      {/* Main text search input with search icon */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for audio files..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-bar-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Container for all filter options */}
      <Card className="filters-card" elevation={3}>
        <Box className="filters-container" sx={{ display: "flex", flexWrap: "wrap", gap: 2, padding: 2 }}>

          {/* Row 1: Time range and genre filters */}
          <Box sx={{ display: "flex", flex: "1 1 100%", gap: 2, justifyContent: "space-between" }}>

            {/* Time Range filter */}
            <FormControl className="filter-item" sx={{ flex: 1 }}>
              <InputLabel>Published Within</InputLabel>
              <Select value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Published Within">
                <MenuItem value="">-</MenuItem>
                <MenuItem value="24h">24 hours</MenuItem>
                <MenuItem value="48h">48 hours</MenuItem>
                <MenuItem value="7d">7 days</MenuItem>
                <MenuItem value="1m">1 month</MenuItem>
                <MenuItem value="3m">3 months</MenuItem>
                <MenuItem value="6m">6 months</MenuItem>
              </Select>
            </FormControl>

            {/* Genre filter */}
            <FormControl className="filter-item" sx={{ flex: 1 }}>
              <InputLabel>Genre</InputLabel>
              <Select value={genre}
                onChange={handleGenreChange}
                label="Genre"
                className="filter-select">
                <MenuItem value="">-</MenuItem>
                {genreOptions &&
                  genreOptions.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          {/* Row 2: Mode, Key, BPM range */}
          <Box sx={{ display: "flex", flex: "1 1 100%", gap: 2, justifyContent: "space-between" }}>

            {/* Mode filter */}
            <FormControl className="filter-item" sx={{ flex: 1 }}>
              <InputLabel>Mode</InputLabel>
              <Select value={mode} onChange={handleModeChange} variant="outlined" className="filter-select" label="Mode">
                <MenuItem value="">-</MenuItem>
                <MenuItem value="major">Major</MenuItem>
                <MenuItem value="minor">Minor</MenuItem>
              </Select>
            </FormControl>

            {/* Key filter - conditional on mode being selected */}
            {mode && (
              <FormControl className="filter-item" sx={{ flex: 1 }}>
                <InputLabel>Key</InputLabel>
                <Select value={key} onChange={handleKeyChange} variant="outlined" className="filter-select" label="Key">
                  <MenuItem value="">-</MenuItem>
                  {keyOptions.map((note) => (
                    <MenuItem key={note} value={note}>
                      {note} {mode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* BPM Range filter with min and max inputs */}
            <Box className="filter-item bpm-range-container" sx={{ display: "flex", gap: 1, alignItems: "center", flex: 1 }}>
              <TextField
                type="number"
                label="Min BPM"
                name="min"
                value={bpmRange.min}
                onChange={handleBpmRangeChange}
                placeholder="Min"
                InputLabelProps={{ shrink: true }}
                className="bpm-input"
                sx={{ flex: 1 }}
              />
              <span className="bpm-separator" style={{ padding: "0 8px" }}>
                –
              </span>
              <TextField
                type="number"
                label="Max BPM"
                name="max"
                value={bpmRange.max}
                onChange={handleBpmRangeChange}
                placeholder="Max"
                InputLabelProps={{ shrink: true }}
                className="bpm-input"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          {/* Row 3: Reserved space or potential future use */}
          <Box
            sx={{
              display: "flex",
              flex: "1 1 100%",
              gap: 2,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
          </Box>

          {/* Row 4: Instrument and Sort Options */}
          <Box sx={{ display: "flex", flex: "1 1 100%", gap: 2, justifyContent: "space-between" }}>

            {/* Instrument filter */}
            <FormControl className="filter-item" sx={{ flex: 1 }}>
              <InputLabel id="instrument-label">Instrument</InputLabel>
              <Select
                labelId="instrument-label"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                label="Instrument"
              >
                <MenuItem value="">-</MenuItem>
                {instrumentOptions &&
                  instrumentOptions.map((inst) => (
                    <MenuItem key={inst} value={inst}>
                      {inst}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Sort option filter */}
            <FormControl className="filter-item" sx={{ flex: 1 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="">Default</MenuItem>
                <MenuItem value="likes">Likes</MenuItem>
                <MenuItem value="downloads">Downloads</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Search Button to apply all filters */}
          <Box sx={{ flex: "1 1 100%", textAlign: "right", marginTop: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchClick}
              className="filter-button"
              sx={{ padding: "8px 24px" }}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default SearchBar;
