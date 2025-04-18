// Import necessary modules from Firebase Firestore and external libraries
import { getFirestore, query, where, collection, getDocs } from "firebase/firestore";
import AWS from "aws-sdk";
import axios from "axios";

// Initialize AWS S3 with credentials and region from environment variables
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

// Fetch publisher data such as username and profile picture from Firestore and S3
export const fetchPublisherData = async (file) => {
  try {
    // Guard clause to ensure file.uid exists
    if (!file.uid) {
      console.error("Error: file.uid is undefined");
      return { publisherName: "Unknown", profilePicture: null };
    }

    // Access Firestore and query the 'users' collection by UID
    const db = getFirestore();
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("uid", "==", file.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Extract user data from the first matched document
      const userData = querySnapshot.docs[0].data();
      const publisherName = userData.username || "Unknown";

      // Construct signed URL for profile picture stored in S3
      const avatarKey = `users/${file.uid}/avatar/profile-picture.jpg`;
      const profilePicture = s3.getSignedUrl("getObject", {
        Bucket: "looplib-audio-bucket",
        Key: avatarKey,
      });

      return { publisherName, profilePicture };
    } else {
      // Log warning if no user was found in Firestore
      console.error("No matching Firestore document found for UID:", file.uid);
      return { publisherName: "Unknown", profilePicture: null };
    }
  } catch (error) {
    // Catch and log any unexpected errors
    console.error("Error fetching publisher data:", error);
    return { publisherName: "Unknown", profilePicture: null };
  }
};

// Fetch like and download statistics from a JSON file in S3
export const fetchStats = async (file) => {
  try {
    // Define the key for the stats file in S3
    const statsKey = `users/${file.uid}/stats/${file.name}.stats.json`;

    // Generate a signed URL for accessing the stats file
    const statsUrl = s3.getSignedUrl("getObject", {
      Bucket: "looplib-audio-bucket",
      Key: statsKey,
    });

    // Fetch the stats data via HTTP
    const response = await axios.get(statsUrl);

    // Return parsed stats with default values if missing
    return {
      likes: response.data.likes || 0,
      downloads: response.data.downloads || 0,
    };
  } catch (error) {
    // Log error and return fallback stats if something goes wrong
    console.error("Error fetching stats:", error);
    return { likes: 0, downloads: 0 };
  }
};

// Check if a specific user has liked a particular audio file
export const fetchUserLikedStatus = async (file, uid) => {
  try {
    // Define the key for the stats file in S3
    const statsKey = `users/${file.uid}/stats/${file.name}.stats.json`;

    // Generate a signed URL for the stats file
    const statsUrl = s3.getSignedUrl("getObject", {
      Bucket: "looplib-audio-bucket",
      Key: statsKey,
    });

    // Fetch the stats JSON to access the list of user IDs who liked the file
    const response = await axios.get(statsUrl);
    const likedBy = response.data.likedBy || [];

    // Return true if the user ID is in the likedBy array
    return likedBy.includes(uid);
  } catch (error) {
    // Log error and default to false if an error occurs
    console.error("Error fetching user like status:", error);
    return false;
  }
};
