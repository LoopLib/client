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
import AudioCard from "../home/audio-card/audio-card";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import BrowseFiles from "./browse-files/browse-files";
import { useNavigate } from 'react-router-dom';
import Snackbar from "@mui/material/Snackbar";

const FileUpload = () => {

    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [bpm, setBpm] = useState(null);
    const [key, setKey] = useState(null);
    const [instrument, setInstrument] = useState(null);
    const [fingerprint, setFingerprint] = useState(null); // New state for fingerprint
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const waveSurferRefs = useRef([]);
    const [activeIndexes, setActiveIndexes] = useState([]);

    const [fileName, setFileName] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [duplicateSnackbarOpen, setDuplicateSnackbarOpen] = useState(false);

    const handleFileChange = (event) => {
        const newFile = event.target.files[0];
        if (newFile) {
            setSelectedFile(newFile);
            setBpm(null);
            setKey(null);
            setInstrument(null);
            setFingerprint(null); // Reset fingerprint when a new file is chosen
            setFileName("");
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const newFile = event.dataTransfer.files[0];
        if (newFile) {
            setSelectedFile(newFile);
            setBpm(null);
            setKey(null);
            setFingerprint(null);
            setFileName("");
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
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            setBpm(response.data.bpm);
            setKey(response.data.key);
            setFingerprint(response.data.fingerprint);

            // Check for duplicate fingerprint right after analysis
            const duplicateFound = await checkDuplicateFingerprint(response.data.fingerprint);
            if (duplicateFound) {
                setDuplicateSnackbarOpen(true);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setError("Error uploading file. " + error.response?.data?.details || error.message);
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
        if (!fingerprint) {
            setError("No fingerprint available. Please analyze the file first.");
            return;
        }

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            setError("User not authenticated.");
            return;
        }
        const uid = user.uid;

        const s3 = new AWS.S3({
            region: process.env.REACT_APP_AWS_REGION,
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        });

        try {
            // Skip duplicate check here since it's handled during analysis
            handleCloseDialog();
            setIsLoading(true);

            // Upload audio file
            const audioParams = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/audio/${fileName}`,
                Body: selectedFile,
                ContentType: selectedFile.type,
            };
            await s3.upload(audioParams).promise();

            // Prepare metadata with the fingerprint
            const metadata = {
                name: fileName,
                type: selectedFile.type,
                size: selectedFile.size,
                lastModified: selectedFile.lastModified,
                bpm: bpm || null,
                key: key || null,
                instrument: instrument || null,
                fingerprint: fingerprint || null,
                uploadTimestamp: new Date().toISOString(),
            };
            const metadataParams = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/metadata/${fileName}.metadata.json`,
                Body: JSON.stringify(metadata, null, 2),
                ContentType: "application/json",
            };
            await s3.upload(metadataParams).promise();

            // Upload stats
            const statsParams = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/stats/${fileName}.stats.json`,
                Body: JSON.stringify({ likes: 0, downloads: 0, likedBy: [] }, null, 2),
                ContentType: "application/json",
            };
            await s3.upload(statsParams).promise();

            setError(null);
        } catch (error) {
            console.error("Error publishing file:", error);
            setError(`Failed to publish the audio file and metadata. Error: ${error.message}`);
        } finally {
            setIsLoading(false);
            setOpenDialog(false);
            navigate("/homepage");
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

    const checkDuplicateFingerprint = async (currentFingerprint) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return false;
        const uid = user.uid;
        const s3 = new AWS.S3({
            region: process.env.REACT_APP_AWS_REGION,
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        });
        const listParams = {
            Bucket: "looplib-audio-bucket",
            Prefix: `users/${uid}/metadata/`,
        };
        const metadataList = await s3.listObjectsV2(listParams).promise();
        if (metadataList.Contents && metadataList.Contents.length > 0) {
            const normalizeFingerprint = (fp) =>
                String(fp).trim().replace(/^["']+|["']+$/g, "").toLowerCase();
            const normalizedCurrent = normalizeFingerprint(currentFingerprint);
            for (const obj of metadataList.Contents) {
                const getParams = {
                    Bucket: "looplib-audio-bucket",
                    Key: obj.Key,
                };
                const data = await s3.getObject(getParams).promise();
                const metadataJson = JSON.parse(data.Body.toString("utf-8"));
                const normalizedStored = normalizeFingerprint(metadataJson.fingerprint);
                if (normalizedStored === normalizedCurrent) {
                    return true;
                }
            }
        }
        return false;
    };

    return (
        <Box className="file-upload-container">
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
                        instrument: instrument || "N/A",
                        genre: "N/A",
                        publisher: "You",
                        likes: 0,
                        downloads: 0,
                    }}
                    index={0}
                    activeIndexes={activeIndexes}
                    setActiveIndexes={setActiveIndexes}
                    waveSurferRefs={waveSurferRefs}
                    showExtras={false}
                    showAvatar={false}
                    showLikeButton={false}
                    showStats={false}
                />
            )}
            <Snackbar
                open={duplicateSnackbarOpen}
                autoHideDuration={6000}
                onClose={() => setDuplicateSnackbarOpen(false)}
                message="Duplicate audio fingerprint found. This file already exists."
            />

            {isLoading && (
                <Box className="loading-overlay">
                    <CircularProgress size={50} />
                </Box>
            )}

            {error && (
                <Typography variant="body1" color="error">
                    {error}
                </Typography>
            )}

            {selectedFile && (
                <>
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUploadAndAnalyze}
                            startIcon={<UploadFileIcon />}
                            disabled={isLoading}
                        >
                            Analyze
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenDialog}
                            startIcon={<PublishIcon />}
                            disabled={isLoading}
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
