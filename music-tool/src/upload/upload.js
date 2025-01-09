import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PublishIcon from "@mui/icons-material/Publish";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import axios from "axios";
import AWS from "aws-sdk";
import "./upload.css";
import AudioCard from "../audio-card/audio-card";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import BrowseFiles from "../browse-files/browse-files";


const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [bpm, setBpm] = useState(null);
    const [key, setKey] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const waveSurferRefs = useRef([]);
    const [activeIndexes, setActiveIndexes] = useState([]);

    const [fileName, setFileName] = useState(""); // Added state for file name
    const [openDialog, setOpenDialog] = useState(false); // State for dialog visibility

    const handleFileChange = (event) => {
        const newFile = event.target.files[0];
        if (newFile) {
            // Reset previous file state
            setSelectedFile(newFile);
            setBpm(null);
            setKey(null);
            setFileName(""); // Reset file name field in the dialog
        }
    };
    
    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
    
        const newFile = event.dataTransfer.files[0];
        if (newFile) {
            // Reset previous file state
            setSelectedFile(newFile);
            setBpm(null);
            setKey(null);
            setFileName(""); // Reset file name field in the dialog
        }
    };
    

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleUploadAndAnalyze = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        setIsLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:5000/upload",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            setBpm(response.data.bpm);
            setKey(response.data.key);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedFile) {
            setError("No file to publish.");
            return;
        }
        if (!fileName) {
            setError("Please provide a file name.");
            return;
        }
    
        setIsLoading(true);
    
        try {
            const auth = getAuth();
            const user = auth.currentUser;
    
            if (!user) {
                throw new Error("User not authenticated");
            }
    
            const uid = user.uid;
    
            const s3 = new AWS.S3({
                region: process.env.REACT_APP_AWS_REGION,
                accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
            });
    
            // Audio Upload
            const audioParams = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/audio/${fileName}`,
                Body: selectedFile,
                ContentType: selectedFile.type,
            };
            await s3.upload(audioParams).promise();
    
            // Metadata Upload
            const metadata = {
                name: fileName,
                type: selectedFile.type,
                size: selectedFile.size,
                lastModified: selectedFile.lastModified,
                bpm: bpm || null,
                key: key || null,
                uploadTimestamp: new Date().toISOString(),
            };
            const metadataParams = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/metadata/${fileName}.metadata.json`,
                Body: JSON.stringify(metadata, null, 2),
                ContentType: "application/json",
            };
            await s3.upload(metadataParams).promise();
    
            // Stats Upload (Likes and Downloads)
            const statsParams = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/stats/${fileName}.stats.json`,
                Body: JSON.stringify({ likes: 0, downloads: 0, likedBy: [] }, null, 2),
                ContentType: "application/json",
              };
              await s3.upload(statsParams).promise();
    
            alert("Audio, metadata, and stats have been published successfully!");
            setError(null);
        } catch (error) {
            console.error("Error publishing file:", error);
            setError(`Failed to publish the audio file and metadata. Error: ${error.message}`);
        } finally {
            setIsLoading(false);
            setOpenDialog(false);
        }
    };
    


    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleFileNameChange = (event) => {
        setFileName(event.target.value);
    };

    return (
        <Box className="file-upload-container">
            <Typography
                variant="h4"
                className="upload-title"
                mb={4}
                fontFamily={"Montserrat, sans-serif"}
                fontWeight="bold"
            >
                U P L O A D
            </Typography>

            <BrowseFiles
                onFileChange={handleFileChange}
                isDragging={isDragging}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragLeave={handleDragLeave}
            />

            {selectedFile && (
                <AudioCard
                    file={{
                        url: URL.createObjectURL(selectedFile),
                        name: selectedFile.name,
                        duration: "N/A",
                        musicalKey: key ? String(key) : "N/A",
                        bpm: bpm || "N/A",
                        genre: "N/A",
                        publisher: "You",
                    }}
                    index={0}
                    activeIndexes={activeIndexes}
                    setActiveIndexes={setActiveIndexes}
                    waveSurferRefs={waveSurferRefs}
                    showExtras={false} // Hide download button and publisher name
                />

            )}

            {isLoading && (
                <Box display="flex" justifyContent="center" marginTop="16px">
                    <CircularProgress size={24} />
                    <Typography variant="body1" marginLeft="8px">
                        Processing...
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography variant="body1" color="error">
                    {error}
                </Typography>
            )}

            {selectedFile && (
                <>
                    <Box
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUploadAndAnalyze}
                            startIcon={<UploadFileIcon />} // Upload icon
                        >
                            Analyze
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenDialog}
                            startIcon={<PublishIcon />}
                        >
                            Publish
                        </Button>

                    </Box>


                </>
            )}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Enter File Name</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a name for the file before publishing.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="File Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={fileName}
                        onChange={handleFileNameChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handlePublish} color="primary">
                        Publish
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>

    );
};

export default FileUpload;
