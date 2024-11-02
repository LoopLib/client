import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from 'axios'; // Import axios for making HTTP requests
import "./upload.css";


// FileUpload component
// Reference: https://stackoverflow.com/questions/76759517/how-to-write-jest-test-case-for-drag-and-drop-file-in-react
const FileUpload = () => {
    // State to store the selected file
    const [selectedFile, setSelectedFile] = useState(null);
    // State to store whether the user is dragging a file over the dropzone
    const [isDragging, setIsDragging] = useState(false);

    // Function to handle the file input change
    const handleFileChange = (event) => {
        // Set the selected file in the state
        setSelectedFile(event.target.files[0]);
    };

    // Function to handle the form submission
    // This function will be called when the user clicks the submit button
    const handleDrop = (event) => {
        event.preventDefault();
        // Prevent the default behavior of opening the file in the browser
        setIsDragging(false);
        if (event.dataTransfer.files.length) {
            setSelectedFile(event.dataTransfer.files[0]);
        }
    };

    // Function to handle the file upload
    // This function will be called when the user clicks the upload button
    const handleDragOver = (event) => {
        event.preventDefault();
        // Prevent the default behavior of opening the file in the browser
        setIsDragging(true);
    };

    // Function to handle the drag leave event
    // This function will be called when the user drags a file out of the dropzone
    const handleDragLeave = () => {
        // Set isDragging to false to hide the dropzone border
        setIsDragging(false);
    };

    // Function to handle the file upload and analysis
    const handleUploadAndAnalyze = async () => {
        // If no file is selected, return
        if (!selectedFile) return;
        
        // Create a FormData object to store the file
        const formData = new FormData();
        // Append the file to the FormData object
        formData.append("file", selectedFile);
    
        try {
            // Send a POST request to the backend
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            console.log("File uploaded and analyzed:", response.data);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };
    
    


    return (
        // Reference: https://stackoverflow.com/questions/68900012/how-to-fix-an-upload-icon-to-a-file-upload-input-material-ui
        <Box className="file-upload-container">
            <Paper
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`file-upload-dropzone ${isDragging ? "dragging" : ""}`}
            >
                <UploadFileIcon className="file-upload-icon" />
                <Typography variant="body1" color="textSecondary">
                    Drag & Drop your file here or
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    className="file-upload-button"
                >
                    Browse Files
                    <input type="file" hidden onChange={handleFileChange} />
                </Button>
            </Paper>
            {selectedFile && (
                <Box className="file-upload-preview">
                    <Typography variant="body2">Selected File:</Typography>
                    <Paper className="file-preview-details">
                        <Typography variant="subtitle1">{selectedFile.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                        </Typography>
                    </Paper>

                    {/* Conditionally rendered "Upload and Analyze" Button */}
                    <Button
                        onClick={handleUploadAndAnalyze}
                    >
                        Upload and Analyze
                    </Button>
                </Box>
            )}
 
        </Box>
    );
};

export default FileUpload;
