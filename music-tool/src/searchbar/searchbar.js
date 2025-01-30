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
    InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./searchbar.css";

const SearchBar = ({ onSearchChange }) => {
    const [genre, setGenre] = useState("");
    const [key, setKey] = useState("");
    const [mode, setMode] = useState("");
    const [bpmRange, setBpmRange] = useState({ min: "", max: "" });
    const [publishedDate, setPublishedDate] = useState("");

    const handleGenreChange = (event) => setGenre(event.target.value);
    const handleKeyChange = (event) => setKey(event.target.value);
    const handleModeChange = (event) => setMode(event.target.value);
    const handleBpmRangeChange = (event) => {
        const { name, value } = event.target;
        setBpmRange((prevRange) => ({ ...prevRange, [name]: value }));
    };
    const handleSearchClick = () => {
        console.log("Filters Applied:", { genre, key, mode, bpmRange, publishedDate });
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
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                }}
            />

           {/* Filters */}
<Card className="filters-card" elevation={3}>
    <Box className="filters-container" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 2 }}>
        {/* Row 1 */}
        <Box sx={{ display: 'flex', flex: '1 1 100%', gap: 2, justifyContent: 'space-between' }}>
            {/* Published Date */}
            <TextField
                type="date"
                label="Published Date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className="filter-item"
                sx={{ flex: 1 }}
            />

            {/* Genre */}
            <FormControl className="filter-item" sx={{ flex: 1 }}>
                <InputLabel>Genre</InputLabel>
                <Select
                    value={genre}
                    onChange={handleGenreChange}
                    variant="outlined"
                    className="filter-select"
                >
                    <MenuItem value="">-</MenuItem>
                    <MenuItem value="pop">Pop</MenuItem>
                    <MenuItem value="rock">Rock</MenuItem>
                    <MenuItem value="hip-hop">Hip-Hop</MenuItem>
                    <MenuItem value="electronic">Electronic</MenuItem>
                    <MenuItem value="jazz">Jazz</MenuItem>
                </Select>
            </FormControl>
        </Box>

        {/* Row 2 */}
        <Box sx={{ display: 'flex', flex: '1 1 100%', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Key */}
            <FormControl className="filter-item" sx={{ flex: 1 }}>
                <InputLabel>Key</InputLabel>
                <Select
                    value={key}
                    onChange={handleKeyChange}
                    variant="outlined"
                    className="filter-select"
                >
                    <MenuItem value="">-</MenuItem>
                    {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((note) => (
                        <MenuItem key={note} value={note}>
                            {note}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Mode */}
            <FormControl className="filter-item" sx={{ flex: 1 }}>
                <InputLabel>Mode</InputLabel>
                <Select
                    value={mode}
                    onChange={handleModeChange}
                    variant="outlined"
                    className="filter-select"
                >
                    <MenuItem value="">-</MenuItem>
                    <MenuItem value="major">Major</MenuItem>
                    <MenuItem value="minor">Minor</MenuItem>
                </Select>
            </FormControl>

            {/* BPM Range */}
            <Box className="filter-item bpm-range-container" sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                <TextField
                    type="number"
                    label="Min BPM"
                    name="min"
                    value={bpmRange.min}
                    onChange={handleBpmRangeChange}
                    placeholder="Min BPM"
                    InputLabelProps={{ shrink: true }}
                    className="bpm-input"
                    sx={{ flex: 1 }}
                />
                <span className="bpm-separator" style={{ padding: '0 8px' }}>–</span>
                <TextField
                    type="number"
                    label="Max BPM"
                    name="max"
                    value={bpmRange.max}
                    onChange={handleBpmRangeChange}
                    placeholder="Max BPM"
                    InputLabelProps={{ shrink: true }}
                    className="bpm-input"
                    sx={{ flex: 1 }}
                />
            </Box>
        </Box>

        {/* Apply Filters Button */}
        <Box sx={{ flex: '1 1 100%', textAlign: 'right', marginTop: 2 }}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleSearchClick}
                className="filter-button"
                sx={{ padding: '8px 24px' }}
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
