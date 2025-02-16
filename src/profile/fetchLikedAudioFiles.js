import AWS from "aws-sdk";
import { getAuth } from "firebase/auth";
import axios from "axios";

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

export const fetchLikedAudioFiles = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User is not logged in.");
      return [];
    }

    const uid = user.uid;
    const statsPrefix = `users/`; // Adjust to your stats storage path

    // Fetch all user stats files
    const params = {
      Bucket: "looplib-audio-bucket",
      Prefix: statsPrefix,
    };

    const data = await s3.listObjectsV2(params).promise();
    const likedFiles = [];

    await Promise.all(
      data.Contents.map(async (file) => {
        if (file.Key.endsWith(".stats.json")) {
          const statsUrl = s3.getSignedUrl("getObject", { Bucket: params.Bucket, Key: file.Key });
          try {
            const response = await axios.get(statsUrl);
            const stats = response.data;
            
            if (stats.likedBy && stats.likedBy.includes(uid)) {
              likedFiles.push({
                name: file.Key.split("/").pop().replace(".stats.json", ""),
                key: file.Key.replace("/stats/", "/audio/").replace(".stats.json", ""),
                url: `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${file.Key.replace("/stats/", "/audio/").replace(".stats.json", "")}`,
                likes: stats.likes || 0,
              });
            }
          } catch (error) {
            console.warn(`Error fetching stats for ${file.Key}: ${error.message}`);
          }
        }
      })
    );

    return likedFiles;
  } catch (error) {
    console.error("Error fetching liked audio files:", error);
    return [];
  }
};