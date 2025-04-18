// Import necessary libraries and modules
import AWS from "aws-sdk";
import { getAuth } from "firebase/auth";
import axios from "axios";

// Initialize the AWS S3 client with credentials and region from environment variables
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

// Function to fetch audio files liked by the current user
export const fetchLikedAudioFiles = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    // Check if user is logged in
    if (!user) {
      console.error("User is not logged in.");
      return [];
    }

    const uid = user.uid;
    const statsPrefix = `users/`; // Prefix where user stats are stored in S3

    // Parameters for listing objects in the S3 bucket
    const params = {
      Bucket: "looplib-audio-bucket",
      Prefix: statsPrefix,
    };

    // List all objects under the specified prefix
    const data = await s3.listObjectsV2(params).promise();
    const likedFiles = [];

    // Loop through each file in the S3 bucket
    await Promise.all(
      data.Contents.map(async (file) => {
        // Process only stats JSON files
        if (file.Key.endsWith(".stats.json")) {
          // Generate a signed URL to access the stats file
          const statsUrl = s3.getSignedUrl("getObject", { Bucket: params.Bucket, Key: file.Key });
          try {
            // Fetch the stats JSON file
            const response = await axios.get(statsUrl);
            const stats = response.data;

            // Check if the current user liked this file
            if (stats.likedBy && stats.likedBy.includes(uid)) {
              likedFiles.push({
                // Extract audio file name (without extension)
                name: file.Key.split("/").pop().replace(".stats.json", ""),
                // Convert the stats file path to the corresponding audio file key
                key: file.Key.replace("/stats/", "/audio/").replace(".stats.json", ""),
                // Construct a direct URL to the audio file
                url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${file.Key.replace("/stats/", "/audio/").replace(".stats.json", "")}`,
                // Include the number of likes if available
                likes: stats.likes || 0,
              });
            }
          } catch (error) {
            // Handle errors in fetching or parsing the stats file
            console.warn(`Error fetching stats for ${file.Key}: ${error.message}`);
          }
        }
      })
    );

    // Return the list of liked audio files
    return likedFiles;
  } catch (error) {
    // Log any unexpected errors
    console.error("Error fetching liked audio files:", error);
    return [];
  }
};
