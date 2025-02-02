import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  Menu,
  MenuItem,
  Button,
  Pagination,
} from "@mui/material";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";
import AudioCard from "../audio-card/audio-card";
import SearchBar from "../searchbar/searchbar";
import LoadingPage from "../../loading/loading";
import "./library.css";

const Library = ({ ownerUid = null }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  }, [ownerUid]);

  const fetchAudioFilesFromAWS = async () => {
    setLoading(true);
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      const prefix = ownerUid ? `users/${ownerUid}/audio/` : "users/";
      const params = { Bucket: "looplib-audio-bucket", Prefix: prefix };

      const data = await s3.listObjectsV2(params).promise();

      const audioFiles = data.Contents.filter((file) => file.Key.includes("/audio/"));
      const metadataFiles = data.Contents.filter((file) => file.Key.includes("/metadata/"));

      const files = await Promise.all(
        audioFiles.map(async (audioFile) => {
          const metadataKey = audioFile.Key.replace("/audio/", "/metadata/") + ".metadata.json";
          const metadataFile = metadataFiles.find((file) => file.Key === metadataKey);

          let metadata = {};
          if (metadataFile) {
            const metadataParams = {
              Bucket: params.Bucket,
              Key: metadataKey,
            };
            const metadataObject = await s3.getObject(metadataParams).promise();
            metadata = JSON.parse(metadataObject.Body.toString());
          }

          const uid = audioFile.Key.split("/")[1];

          return {
            name: audioFile.Key.split("/").pop(),
            url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${audioFile.Key}`,
            uid,
            publisher: "Anonymous Publisher",
            duration: metadata.duration || "Unknown",
            bpm: metadata.bpm || "Unknown",
            musicalKey: metadata.key || "Unknown",
            genre: metadata.genre || "Unknown",
            ownerUid: uid,
          };
        })
      );

      const userSpecificFiles = ownerUid ? files.filter((file) => file.uid === ownerUid) : files;

      setAudioFiles(userSpecificFiles);
      setFilteredFiles(userSpecificFiles);
    } catch (error) {
      console.error("Error fetching audio files from AWS:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = audioFiles.filter((file) =>
      file.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredFiles(filtered);
    setCurrentPage(1); // Reset to the first page when search changes
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

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
    return <LoadingPage />;
  }

  return (
    <Box
      className="all-audio-container"
      sx={{
        width: "80%",
        maxWidth: "none",
        margin: "20px auto",
      }}
    >
      <SearchBar onSearchChange={handleSearchChange} />
      <List>
        {currentItems.length > 0 ? (
          currentItems.map((file, index) => (
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
      <Pagination
        count={Math.ceil(filteredFiles.length / itemsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        sx={{ display: "flex", justifyContent: "center", mt: 2 }}
      />
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
