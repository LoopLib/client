// AudioFilesTable.js
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PianoIcon from "@mui/icons-material/Piano";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";

// Create a styled version of the TableRow component using MUI's styled utility
const StyledTableRow = styled(TableRow)(({ theme, striped }) => ({
  // Set background color based on the 'striped' prop
  backgroundColor: striped ? theme.palette.action.hover : "inherit",

  // Define a hover style for the table row
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const AudioFilesTable = ({
  audioFiles,
  editingFile,
  newFileName,
  setNewFileName,
  handleEditFile,
  handleSaveEdit,
  handleDeleteFile,
}) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSaveEditInternal = async () => {
    try {
      await handleSaveEdit();
      setSnackbar({ open: true, message: "File renamed successfully", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to rename file", severity: "error" });
    }
  };

  const handleDeleteFileInternal = async (fileKey) => {
    try {
      await handleDeleteFile(fileKey);
      setSnackbar({ open: true, message: "File deleted successfully", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to delete file", severity: "error" });
    }
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          mt: 4,
          borderRadius: 2,
          boxShadow: 3,
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ backgroundColor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                FILE NAME
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>BPM</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>KEY</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                GENRE
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                INSTRUMENT
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {audioFiles.map((file, index) => (
              <StyledTableRow key={file.key} striped={index % 2 === 0}>
                <TableCell>
                  {editingFile?.key === file.key ? (
                    <TextField
                      label="New File Name"
                      variant="outlined"
                      size="small"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      fullWidth
                    />
                  ) : (
                    <Typography variant="body1" fontWeight="500">
                      {file.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {file.bpm} bpm
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={file.musicalKey}
                    color="secondary"
                    size="small"
                    icon={<MusicNoteIcon />}
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={file.genre}
                    variant="outlined"
                    color="primary"
                    size="small"
                    icon={<LibraryMusicIcon />}
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={file.instrument}
                    variant="outlined"
                    color="primary"
                    size="small"
                    icon={<PianoIcon />}
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  {editingFile?.key === file.key ? (
                    <Tooltip title="Save">
                      <IconButton onClick={handleSaveEditInternal} color="success">
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditFile(file)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDeleteFileInternal(file.key)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AudioFilesTable;
