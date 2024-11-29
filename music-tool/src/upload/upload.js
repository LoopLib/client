import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
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
    
            // Upload the audio file
            const audioParams = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/audio/${selectedFile.name}`, // Store audio file in "audio" folder
                Body: selectedFile,
                ContentType: selectedFile.type,
            };
    
            console.log("Uploading audio file with params:", audioParams);
            const uploadResult = await s3.upload(audioParams).promise();
            console.log("Audio file uploaded successfully:", uploadResult);
    
            // Prepare metadata
            const metadata = {
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                lastModified: selectedFile.lastModified,
                bpm: bpm || null,
                key: key || null,
                uploadTimestamp: new Date().toISOString(),
            };
    
            console.log("Metadata object:", metadata);
    
            // Upload metadata to a "metadata" folder
            const metadataParams = {
                Bucket: "looplib-audio-bucket",
                Key: `users/${uid}/metadata/${selectedFile.name}.metadata.json`, // Store metadata in "metadata" folder
                Body: JSON.stringify(metadata, null, 2),
                ContentType: "application/json",
            };
    
            console.log("Uploading metadata with params:", metadataParams);
            const metadataUploadResult = await s3.upload(metadataParams).promise();
            console.log("Metadata uploaded successfully:", metadataUploadResult);
    
            alert("Audio and metadata have been published successfully!");
            setError(null);
        } catch (error) {
            console.error("Error publishing file:", error);
            setError(`Failed to publish the audio file and metadata. Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    

    return (
        <Box
            className="file-upload-container"
            sx={{
                width: "80%",
                maxWidth: "none",
                margin: "20px auto",
            }}

        >
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
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap="16px"
                        marginTop="20px"
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            style={{
                                position: "relative", // Center-friendly styling
                                padding: "12px 24px",
                            }}
                            onClick={handleUploadAndAnalyze}
                            startIcon={<UploadFileIcon />} // Upload icon
                        >
                            Upload and Analyze
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            style={{
                                position: "relative", // Center-friendly styling
                                padding: "12px 24px",
                            }}
                            onClick={handlePublish}
                            startIcon={<PublishIcon />} // Publish icon
                        >
                            Publish
                        </Button>
                    </Box>


                </>
            )}
        </Box>
    );
};

export default FileUpload;
