import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress, List, Menu, MenuItem } from "@mui/material";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";
import AudioCard from "../audiocard/audiocard";
import "./library.css";

const Library = () => {
  const [audioFiles, setAudioFiles] = useState([]);
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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box className="all-audio-container">
      <Typography variant="h4" className="all-audio-title" mb={4}>
        L I B R A R Y
      </Typography>
      <List>
        {audioFiles.length > 0 ? (
          audioFiles.map((file, index) => (
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
            No audio files available.
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
