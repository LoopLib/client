import React from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AWS from "aws-sdk";

const DownloadButton = ({ fileUrl, statsKey, s3, downloads, setDownloads }) => {
  const handleDownload = async (e) => {
    // Increment the download count
    const updatedDownloads = downloads + 1;
    await updateStats({ downloads: updatedDownloads });
    setDownloads(updatedDownloads);

    // Fetch the file and trigger the download manually
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileUrl.split("/").pop(); // Use the filename from the URL
      link.click();
      URL.revokeObjectURL(link.href); // Cleanup the URL object after download
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const updateStats = async (updatedFields) => {
    try {
      const updatedStats = { downloads, ...updatedFields };

      // Upload the updated stats to AWS S3
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
      onClick={handleDownload}
      style={{
        position: "absolute",
        right: "20px",
        bottom: "20px",
        display: "flex",
        border: "3px solid #000",
        justifyContent: "center",
        alignItems: "center",
        width: "40px",
        height: "40px",
        padding: 0,
        minWidth: "unset",
      }}
    >
      <DownloadIcon />
    </Button>
  );
};

export default DownloadButton;
