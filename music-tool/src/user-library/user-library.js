import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import AudioCard from "../audio-card/audio-card";

const UserLibrary = ({ match }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [publisherName, setPublisherName] = useState("User");
  const { userUid } = match.params;

  useEffect(() => {
    const fetchUserAudioFiles = async () => {
      try {
        const db = getFirestore();
        const q = query(collection(db, "audioFiles"), where("uid", "==", userUid));
        const querySnapshot = await getDocs(q);

        const files = [];
        querySnapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() });
        });

        setAudioFiles(files);

        if (files.length > 0 && files[0].publisher) {
          setPublisherName(files[0].publisher);
        }
      } catch (error) {
        console.error("Error fetching audio files:", error);
      }
    };

    fetchUserAudioFiles();
  }, [userUid]);

  return (
    <Box sx={{ width: "80%", margin: "20px auto" }}>
      <Typography
        variant="h4"
        mb={4}
        fontFamily={"Montserrat, sans-serif"}
        fontWeight="bold"
      >
        {publisherName}'s Library
      </Typography>

      <Grid container spacing={4}>
        {audioFiles.length > 0 ? (
          audioFiles.map((file, index) => (
            <Grid item xs={12} sm={6} md={4} key={file.id}>
              <AudioCard file={file} index={index} />
            </Grid>
          ))
        ) : (
          <Typography variant="body1">No audio files available.</Typography>
        )}
      </Grid>
    </Box>
  );
};

export default UserLibrary;
