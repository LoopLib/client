
import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography, Paper, IconButton, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import axios from 'axios';
import WaveSurfer from "wavesurfer.js";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Firestore SDK
import AWS from "aws-sdk"; // AWS SDK
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./upload.css";
import { db } from "../firebaseConfig";


// FileUpload component
// Reference: https://stackoverflow.com/questions/76759517/how-to-write-jest-test-case-for-drag-and-drop-file-in-react
const FileUpload = () => {
    // State to store the selected file
    const [selectedFile, setSelectedFile] = useState(null);
    // State to store whether the user is dragging a file over the dropzone
    const [isDragging, setIsDragging] = useState(false);
    const [bpm, setBpm] = useState(null); // State to store the BPM
    const [key, setKey] = useState(null); // State to store the key
    const [isPlaying, setIsPlaying] = useState(false); // Track if audio is playing
    const [duration, setDuration] = useState(0); // Duration of the audio file
    const [currentTime, setCurrentTime] = useState(0); // Current playback time
    const [error, setError] = useState(null); // State to store any error message
    const [waveform, setWaveform] = useState(null); // State to store waveform instance
    const waveformRef = useRef(null); // Ref to attach waveform container
    const wavesurferRef = useRef(null); // Ref to store WaveSurfer instance
    const [isLoading, setIsLoading] = useState(false); // New loading state

    useEffect(() => {
        if (selectedFile && waveformRef.current) {
            const wavesurfer = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: "#6a11cb",
                progressColor: "#000000",
                cursorColor: "#000000",
                barWidth: 2,
                responsive: true,
                height: 100,
                autoCenter: true,
                backend: "MediaElement",
                pixelRatio: 1,
            });

            const objectUrl = URL.createObjectURL(selectedFile);
            wavesurfer.load(objectUrl);
            wavesurferRef.current = wavesurfer;

            // Event listener to handle when the audio is ready
            wavesurfer.on("ready", () => {
                console.log("WaveSurfer is ready");
                setDuration(wavesurfer.getDuration()); // Set the duration
            });

            // Event listener to handle play/pause state update
            wavesurfer.on("play", () => setIsPlaying(true));
            wavesurfer.on("pause", () => setIsPlaying(false));
            wavesurfer.on("finish", () => setIsPlaying(false));

            // Update current time as the audio plays
            wavesurfer.on("audioprocess", () => {
                setCurrentTime(wavesurfer.getCurrentTime());
            });

            // Clean up
            return () => {
                wavesurfer.destroy();
                URL.revokeObjectURL(objectUrl);
            };
        }
    }, [selectedFile]);


    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Authenticated user UID:", user.uid); // Log the UID for debugging
            const userDocRef = doc(db, "users", user.uid);
    
            try {
                const userDoc = await getDoc(userDocRef);
    
                if (!userDoc.exists()) {
                    console.error("Firestore document not found for UID:", user.uid);
                    throw new Error("User not found in Firestore");
                }
    
                console.log("User document data:", userDoc.data());
            } catch (error) {
                console.error("Error fetching Firestore document:", error);
            }
        } else {
            console.error("User is not authenticated");
        }
    });

    // Function to handle the file input change
    const handleFileChange = (event) => {
        // Set the selected file in the state
        setSelectedFile(event.target.files[0]);
        // Reset bpm and key to hide them until analysis completes
        setBpm(null);
        setKey(null);
    };

    // Function to handle the form submission
    // This function will be called when the user clicks the submit button
    const handleDrop = (event) => {
        event.preventDefault();
        // Prevent the default behavior of opening the file in the browser
        setIsDragging(false);
        if (event.dataTransfer.files.length) {
            setSelectedFile(event.dataTransfer.files[0]);
            // Reset bpm and key to hide them until analysis completes
            setBpm(null);
            setKey(null);
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

        setIsLoading(true); // Start loading

        try {
            // Send a POST request to the backend
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("File uploaded and analyzed:", response.data);
            setBpm(response.data.bpm); // Store the BPM in the state
            setKey(response.data.key); // Store the key in the state
            setError(null); // Clear any previous error
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsLoading(false); // End loading
        }
    };

    // Function to toggle play/pause
    const togglePlay = () => {
        // Toggle the isPlaying state
        if (wavesurferRef.current) {
            if (wavesurferRef.current.isPlaying()) {
                wavesurferRef.current.pause();
            } else {
                wavesurferRef.current.play();
            }
        }
    };

    // Helper function to format time in mm:ss
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handlePublish = async () => {
        if (!selectedFile) {
            setError("No file to publish.");
            return;
        }
    
        setIsLoading(true); // Show loading state
    
        try {
            // Ensure the user is authenticated
            const auth = getAuth();
            const user = auth.currentUser;
    
            if (!user) {
                throw new Error("User not authenticated");
            }
    
            const uid = user.uid; // Authenticated user's UID
            console.log("Publishing file for UID:", uid);
    
            const userDocRef = doc(db, "users", uid); // Dynamically use the user's UID
            const userDoc = await getDoc(userDocRef);
    
            if (!userDoc.exists()) {
                console.error("Document does not exist for UID:", uid);
                throw new Error("User not found in Firestore");
            }
    
            console.log("Firestore document data:", userDoc.data());
    
    
            const params = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/${selectedFile.name}`,
                Body: selectedFile,
                ContentType: selectedFile.type,
            };
    
            const uploadResult = await s3.upload(params).promise();
            console.log("File uploaded successfully:", uploadResult);
    
            alert("Audio has been published successfully!");
            setError(null); // Clear any previous error
        } catch (error) {
            console.error("Error publishing file:", error.message || error);
            setError("Failed to publish the audio file. Please try again.");
        } finally {
            setIsLoading(false); // Hide loading state
        }
    };
    



    return (
        <Box className="file-upload-container">
            <Paper
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`file-upload-dropzone ${isDragging ? "dragging" : ""}`}
                style={{ maxWidth: "60%", margin: "0 auto", borderRadius: "25px" }}
            >
                <UploadFileIcon className="file-upload-icon" />
                <Typography variant="body1" color="textSecondary">
                    Drag & Drop your file here or
                </Typography>
                <Button
                    variant="contained"
                    component="label"
                    className="file-upload-button"
                    sx={{
                        marginTop: '20px',
                        fontWeight: 'bold',
                        background: '#6a11cb',
                        color: 'white',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                    }}

                >
                    Browse Files
                    <input type="file" hidden onChange={handleFileChange} />
                </Button>
            </Paper>

            {selectedFile && (
                <Box className="file-playback-section"
                    style={{ maxWidth: "90%", borderRadius: "25px" }}>
                    <Typography variant="subtitle1" className="file-upload-file-name">
                        {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                    </Typography>


                    <Box className="waveform-display-container">
                        <Typography variant="h6" marginBottom="16px">
                            AUDIO PLAYBACK
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <div
                                color='secondary'
                                ref={waveformRef}
                                className="waveform-container"
                                style={{ flex: 1 }}
                            ></div>
                            <IconButton
                                onClick={togglePlay}
                                style={{ color: "black" }}
                                aria-label="play/pause"
                                className="iconButton"
                            >
                                {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
                            </IconButton>

                        </Box>
                        <Box display="flex" justifyContent="space-between" marginTop="8px">
                            <Typography variant="body2">
                                Current Time: {formatTime(currentTime)}
                            </Typography>
                            <Typography variant="body2">
                                Duration: {formatTime(duration)}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handlePublish}
                        sx={{
                            marginTop: '20px',
                            fontWeight: 'bold',
                            background: '#6a11cb',
                            color: 'white',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Publish
                    </Button>
                </Box>
            )}

            {isLoading && (
                <Box display="flex" justifyContent="center" marginTop="16px">
                    <CircularProgress size={24} />
                    <Typography variant="body1" marginLeft="8px">
                        Analyzing...
                    </Typography>
                </Box>
            )}

            {bpm && key && (
                <Box className="bpm-key-display">
                    <Typography variant="body1" className="bpm-key-title">
                        BPM
                    </Typography>
                    <Typography variant="h6" className="bpm-key-text">
                        {bpm}
                    </Typography>
                    <Typography variant="body1" className="bpm-key-title">
                        KEY
                    </Typography>
                    <Typography variant="h6" className="bpm-key-text">
                        {key}
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography variant="body1" color="error">
                    {error}
                </Typography>
            )}

            {selectedFile && (
                <Button
                    onClick={handleUploadAndAnalyze}
                    variant="contained"
                    sx={{
                        marginTop: '20px',
                        fontWeight: 'bold',
                        background: '#6a11cb',
                        color: 'white',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                    }}
                >
                    Upload and Analyze
                </Button>
            )}
        </Box>
    );
};


export default FileUpload;
