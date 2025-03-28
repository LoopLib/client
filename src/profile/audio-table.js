// AudioFilesTable.js
import React from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PianoIcon from "@mui/icons-material/Piano";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";

const StyledTableRow = styled(TableRow)(({ theme, striped }) => ({
  backgroundColor: striped ? theme.palette.action.hover : "inherit",
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
  return (
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
                  label={file.genre}
                  color="secondary"
                  size="small"
                  icon={<MusicNoteIcon />}
                  sx={{ fontWeight: 500 }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={file.musicalKey}
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
                    <IconButton onClick={handleSaveEdit} color="success">
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
                    onClick={() => handleDeleteFile(file.key)}
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
  );
};

export default AudioFilesTable;
