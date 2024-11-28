import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress, List, Menu, MenuItem } from "@mui/material";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";
import AudioCard from "../audio-card/audio-card";
import SearchBar from "../searchbar/searchbar";
import "./library.css";

const Library = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const waveSurferRefs = useRef({});
  const [activeIndexes, setActiveIndexes] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAudioFilesFromAWS();
    return () => {
      Object.values(waveSurferRefs.current).forEach((waveSurfer) => waveSurfer.destroy());
    };
  }, []);

  const fetchAudioFilesFromAWS = async () => {
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      const params = { Bucket: "looplib-audio-bucket" };
      const data = await s3.listObjectsV2(params).promise();

      const files = data.Contents.map((file) => ({
        name: file.Key.split("/").pop(),
        url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${file.Key}`,
        publisher: "Anonymous Publisher",
        duration: null,
      }));

      setAudioFiles(files);
      setFilteredFiles(files);

      for (let i = 0; i < files.length; i++) {
        const audio = new Audio(files[i].url);
        audio.addEventListener("loadedmetadata", () => {
          setAudioFiles((prev) =>
            prev.map((item, index) =>
              index === i ? { ...item, duration: formatDuration(audio.duration) } : item
            )
          );
        });
      }
    } catch (error) {
      console.error("Error fetching audio files from AWS:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleRightClick = (event, file) => {
    event.preventDefault();
    setSelectedFile(file);
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        : null
    );
  };

  const closeContextMenu = () => {
    setContextMenu(null);
    setSelectedFile(null);
  };

  const handleOptionSelect = (option) => {
    if (option === "edit") {
      alert(`Editing ${selectedFile.name}`);
      navigate("/edit", { state: { file: selectedFile } });
    } else if (option === "delete") {
      alert(`Deleting ${selectedFile.name}`);
    }
    closeContextMenu();
  };

  const handleSearchChange = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    setFilteredFiles(
      audioFiles.filter((file) => file.name.toLowerCase().includes(lowerCaseQuery))
    );
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box
      className="all-audio-container"
      sx={{
        width: "80%", // Allow full width for the container
        maxWidth: "none", // Remove width limitation
        margin: "20px auto", // Center horizontally
      }}
    >
      <Typography
        variant="h4"
        className="all-audio-title"
        mb={4}
        fontFamily={"Montserrat, sans-serif"}
        fontWeight="bold"
      >
        L I B R A R Y
      </Typography>
      <SearchBar onSearchChange={handleSearchChange} />
      <List>
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file, index) => (
            <AudioCard
              key={index}
              file={file}
              index={index}
              activeIndexes={activeIndexes}
              setActiveIndexes={setActiveIndexes}
              waveSurferRefs={waveSurferRefs}
              onContextMenu={(event) => handleRightClick(event, file)}
            />
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No audio files found.
          </Typography>
        )}
      </List>

      <Menu
        open={contextMenu !== null}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        classes={{ paper: "custom-context-menu" }}
      >
        <MenuItem onClick={() => handleOptionSelect("edit")} className="custom-menu-item">
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleOptionSelect("delete")} className="custom-menu-item">
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Library;
