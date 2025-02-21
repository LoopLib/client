import React from "react";
import { Button, Typography, Paper } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const BrowseFiles = ({ onFileChange, isDragging, handleDragOver, handleDrop, handleDragLeave }) => {
    return (
        <Paper
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`file-upload-dropzone ${isDragging ? "dragging" : ""}`}
            style={{
                maxWidth: "60%",
                margin: "0 auto",
                borderRadius: "25px",
                padding: "20px 0",
                border: "3px solid #1976D2",
            }}
        >
            <UploadFileIcon className="file-upload-icon" style={{ fontSize: 48, marginBottom: "16px" }} />
            <Typography variant="body1" color="textSecondary" sx={{ marginBottom: "16px" }}>
                Drag & Drop your file here or
            </Typography>
            <Button
                variant="contained"
                color="primary"
                style={{
                    position: "relative",
                    padding: "6px 15px",
                    marginTop: "10px",
                }}
                component="label"
                startIcon={<FolderOpenIcon />}
            >
                Browse Files
                <input type="file" hidden onChange={onFileChange} />
            </Button>
        </Paper>
    );
};

export default BrowseFiles;
