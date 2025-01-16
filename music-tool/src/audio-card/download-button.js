import React from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AWS from "aws-sdk";

const DownloadButton = ({ fileUrl, statsKey, s3, downloads, setDownloads }) => {
  const handleDownload = async () => {
    const updatedDownloads = downloads + 1;
    await updateStats({ downloads: updatedDownloads });
    setDownloads(updatedDownloads);
    window.open(fileUrl, "_blank");
  };

  const updateStats = async (updatedFields) => {
    try {
      const updatedStats = { downloads, ...updatedFields };

      await s3
        .upload({
          Bucket: "looplib-audio-bucket",
          Key: statsKey,
          Body: JSON.stringify(updatedStats, null, 2),
          ContentType: "application/json",
        })
        .promise();
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      style={{
        position: "absolute",
        right: "20px",
        bottom: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "40px",
        height: "40px",
        padding: 0,
        minWidth: "unset",
      }}
      onClick={handleDownload}
    >
      <DownloadIcon />
    </Button>
  );
};

export default DownloadButton;
