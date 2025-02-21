import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, List, Menu, MenuItem, Pagination } from "@mui/material";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";
import AudioCard from "../audio-card/audio-card";
import SearchBar from "../searchbar/searchbar";
import LoadingPage from "../../loading/loading";
import axios from "axios";
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
      Object.values(waveSurferRefs.current)
        .filter(waveSurfer => waveSurfer && typeof waveSurfer.destroy === "function")
        .forEach(waveSurfer => waveSurfer.destroy());
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

      const audioFilesList = data.Contents.filter((file) => file.Key.includes("/audio/"));
      const metadataFiles = data.Contents.filter((file) => file.Key.includes("/metadata/"));

      const files = await Promise.all(
        audioFilesList.map(async (audioFile) => {
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
          const fileName = audioFile.Key.split("/").pop();

          // Create the basic file object
          const fileObj = {
            name: fileName,
            url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${audioFile.Key}`,
            uid,
            publisher: "Anonymous Publisher",
            duration: metadata.duration || "Unknown",
            bpm: metadata.bpm || "Unknown",
            musicalKey: metadata.key || "Unknown",
            instrument: metadata.instrument || "Unknown",
            genre: metadata.genre || "Unknown",
            ownerUid: uid,
            uploadTimestamp: metadata.uploadTimestamp || null,
          };

          // Fetch the stats (likes & downloads)
          try {
            const statsKey = `users/${uid}/stats/${fileName}.stats.json`;
            const statsUrl = s3.getSignedUrl("getObject", {
              Bucket: params.Bucket,
              Key: statsKey,
            });
            const response = await axios.get(statsUrl);
            const statsData = response.data;
            // Ensure that likes and downloads are numbers
            fileObj.likes = Number(statsData.likes) || 0;
            fileObj.downloads = Number(statsData.downloads) || 0;
          } catch (error) {
            console.error(`Error fetching stats for ${fileName}:`, error.message);
            fileObj.likes = 0;
            fileObj.downloads = 0;
          }

          return fileObj;
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

  const handleSearchChange = (filters) => {
    const { query, genre, mode, key, bpmRange, timeRange, sortOption, instrument } = filters;
    const lowerCaseQuery = query.toLowerCase();
    const filtered = audioFiles.filter((file) => {
      const matchesQuery =
        lowerCaseQuery === "" ||
        file.name.toLowerCase().includes(lowerCaseQuery) ||
        (file.genre && file.genre.toLowerCase().includes(lowerCaseQuery)) ||
        (file.musicalKey && file.musicalKey.toLowerCase().includes(lowerCaseQuery));
  
      const matchesGenre =
        genre === "" || (file.genre && file.genre.toLowerCase() === genre.toLowerCase());
  
      let matchesKey = true;
      if (mode && key) {
        const storedMode = mode === "minor" ? "min" : mode === "major" ? "maj" : mode;
        matchesKey =
          file.musicalKey &&
          file.musicalKey.toLowerCase() === `${key}${storedMode}`.toLowerCase();
      } else if (mode && !key) {
        const storedMode = mode === "minor" ? "min" : mode === "major" ? "maj" : mode;
        matchesKey =
          file.musicalKey &&
          file.musicalKey.toLowerCase().endsWith(storedMode);
      }
  
      let matchesBpm = true;
      if (bpmRange.min || bpmRange.max) {
        const fileBpm = Number(file.bpm);
        if (isNaN(fileBpm)) {
          matchesBpm = false;
        } else {
          if (bpmRange.min && fileBpm < Number(bpmRange.min)) {
            matchesBpm = false;
          }
          if (bpmRange.max && fileBpm > Number(bpmRange.max)) {
            matchesBpm = false;
          }
        }
      }
  
      let matchesTime = true;
      if (timeRange) {
        if (!file.uploadTimestamp) {
          matchesTime = false;
        } else {
          const fileDate = new Date(file.uploadTimestamp);
          const now = new Date();
          const timeDiff = now - fileDate;
          let thresholdMs = 0;
          switch (timeRange) {
            case "24h":
              thresholdMs = 24 * 60 * 60 * 1000;
              break;
            case "48h":
              thresholdMs = 48 * 60 * 60 * 1000;
              break;
            case "7d":
              thresholdMs = 7 * 24 * 60 * 60 * 1000;
              break;
            case "1m":
              thresholdMs = 30 * 24 * 60 * 60 * 1000;
              break;
            case "3m":
              thresholdMs = 90 * 24 * 60 * 60 * 1000;
              break;
            case "6m":
              thresholdMs = 180 * 24 * 60 * 60 * 1000;
              break;
            default:
              thresholdMs = 0;
          }
          matchesTime = timeDiff <= thresholdMs;
        }
      }
  
      let matchesInstrument = true;
      if (instrument) {
        matchesInstrument =
          file.instrument &&
          file.instrument.toLowerCase() === instrument.toLowerCase();
      }
  
      return matchesQuery && matchesGenre && matchesKey && matchesBpm && matchesTime && matchesInstrument;
    });
  
    if (sortOption) {
      filtered.sort((a, b) => (b[sortOption] || 0) - (a[sortOption] || 0));
    }
  
    setFilteredFiles(filtered);
    setCurrentPage(1);
  };
  

  if (loading) {
    return <LoadingPage />;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const instrumentOptions = Array.from(
    new Set(audioFiles.map((file) => file.instrument).filter((inst) => inst && inst !== "Unknown"))
  );
  

  return (
    <Box className="all-audio-container" sx={{ width: "80%", maxWidth: "none", margin: "20px auto" }}>
      <SearchBar onSearchChange={handleSearchChange} instrumentOptions={instrumentOptions} />
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
              onContextMenu={(event) => {
                event.preventDefault();
                setSelectedFile(file);
                setContextMenu({
                  mouseX: event.clientX + 2,
                  mouseY: event.clientY - 6,
                });
              }}
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
        onChange={(event, value) => setCurrentPage(value)}
        sx={{ display: "flex", justifyContent: "center", mt: 2 }}
      />
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            alert(`Editing ${selectedFile.name}`);
            navigate("/edit", { state: { file: selectedFile } });
            setContextMenu(null);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert(`Deleting ${selectedFile.name}`);
            setContextMenu(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Library;
