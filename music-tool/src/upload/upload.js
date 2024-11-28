import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";
import AWS from "aws-sdk";
import "./upload.css";
import AudioCard from "../audio-card/audio-card";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [bpm, setBpm] = useState(null);
    const [key, setKey] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const waveSurferRefs = useRef([]);
    const [activeIndexes, setActiveIndexes] = useState([]);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setBpm(null);
        setKey(null);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files.length) {
            setSelectedFile(event.dataTransfer.files[0]);
            setBpm(null);
            setKey(null);
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
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
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

        setIsLoading(true);

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error("User not authenticated");
            }

            const uid = user.uid;

            const userDocRef = doc(db, "users", uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                throw new Error("User not found in Firestore");
            }

            const s3 = new AWS.S3({
                region: process.env.REACT_APP_AWS_REGION,
                accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
            });

            const params = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/${selectedFile.name}`,
                Body: selectedFile,
                ContentType: selectedFile.type,
            };

            const uploadResult = await s3.upload(params).promise();
            console.log("File uploaded successfully:", uploadResult);

            alert("Audio has been published successfully!");
            setError(null);
        } catch (error) {
            console.error("Error publishing file:", error);
            setError("Failed to publish the audio file. Please try again.");
        } finally {
            setIsLoading(false);
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
                    sx={{
                        marginTop: "20px",
                        fontWeight: "bold",
                        background: "#2575fc",
                        color: "white",
                        borderRadius: "8px",
                        transition: "all 0.3s ease",
                    }}
                >
                    Browse Files
                    <input type="file" hidden onChange={handleFileChange} />
                </Button>
            </Paper>

            {selectedFile && (
                <AudioCard
                    file={{
                        url: URL.createObjectURL(selectedFile),
                        name: selectedFile.name,
                        duration: "N/A",
                        key: key || "N/A",
                        bpm: bpm || "N/A",
                        genre: "N/A",
                        publisher: "You",
                        profilePicture: "",
                    }}
                    index={0}
                    activeIndexes={activeIndexes}
                    setActiveIndexes={setActiveIndexes}
                    waveSurferRefs={waveSurferRefs}
                    onContextMenu={(e) => e.preventDefault()}
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

            {bpm && key && (
                <Box>
                    <Typography variant="body1">BPM: {bpm}</Typography>
                    <Typography variant="body1">Key: {key}</Typography>
                </Box>
            )}

            {error && (
                <Typography variant="body1" color="error">
                    {error}
                </Typography>
            )}

            {selectedFile && (
                <>
                    <Button
                        onClick={handleUploadAndAnalyze}
                        variant="contained"
                        sx={{
                            marginTop: "20px",
                            fontWeight: "bold",
                            background: "#6a11cb",
                            color: "white",
                            borderRadius: "8px",
                            transition: "all 0.3s ease",
                            marginRight: "16px",
                        }}
                    >
                        Upload and Analyze
                    </Button>
                    <Button
                        onClick={handlePublish}
                        variant="contained"
                        sx={{
                            marginTop: "20px",
                            fontWeight: "bold",
                            background: "#2575fc",
                            color: "white",
                            borderRadius: "8px",
                            transition: "all 0.3s ease",
                        }}
                    >
                        Publish
                    </Button>
                </>
            )}
        </Box>
    );
};

export default FileUpload;
