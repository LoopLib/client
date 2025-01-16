import { getFirestore, query, where, collection, getDocs } from "firebase/firestore";
import AWS from "aws-sdk";
import axios from "axios";

// Initialize AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

// Fetch publisher data
export const fetchPublisherData = async (file) => {
  try {
    if (!file.uid) {
      console.error("Error: file.uid is undefined");
      return { publisherName: "Unknown", profilePicture: null };
    }

    const db = getFirestore();
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("uid", "==", file.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      const publisherName = userData.username || "Unknown";

      // Construct profile picture URL from S3
      const avatarKey = `users/${file.uid}/avatar/profile-picture.jpg`;
      const profilePicture = s3.getSignedUrl("getObject", {
        Bucket: "looplib-audio-bucket",
        Key: avatarKey,
      });

      return { publisherName, profilePicture };
    } else {
      console.error("No matching Firestore document found for UID:", file.uid);
      return { publisherName: "Unknown", profilePicture: null };
    }
  } catch (error) {
    console.error("Error fetching publisher data:", error);
    return { publisherName: "Unknown", profilePicture: null };
  }
};

// Fetch stats data
export const fetchStats = async (file) => {
  try {
    const statsKey = `users/${file.uid}/stats/${file.name}.stats.json`;
    const statsUrl = s3.getSignedUrl("getObject", {
      Bucket: "looplib-audio-bucket",
      Key: statsKey,
    });

    const response = await axios.get(statsUrl);
    return { likes: response.data.likes || 0, downloads: response.data.downloads || 0 };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { likes: 0, downloads: 0 };
  }
};

// Fetch user like status
export const fetchUserLikedStatus = async (file, uid) => {
  try {
    const statsKey = `users/${file.uid}/stats/${file.name}.stats.json`;
    const statsUrl = s3.getSignedUrl("getObject", {
      Bucket: "looplib-audio-bucket",
      Key: statsKey,
    });

    const response = await axios.get(statsUrl);
    const likedBy = response.data.likedBy || [];
    return likedBy.includes(uid);
  } catch (error) {
    console.error("Error fetching user like status:", error);
    return false;
  }
};
