// Import React and useState hook
import React, { useState } from "react";

// Import MUI components for UI design
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  Paper,
  LinearProgress,
} from "@mui/material";

// Import Firebase authentication functions
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// Import Firebase auth instance
import { auth } from "../firebaseConfig";

// Import Firebase Firestore database instance
import { db } from "../firebaseConfig";

// Import functions to write to Firestore
import { doc, setDoc } from "firebase/firestore";

// Import hook to programmatically navigate pages
import { useNavigate } from "react-router-dom";

// Import error icon for error alert display
import ErrorIcon from "@mui/icons-material/Error";

// Import zxcvbn for password strength analysis
import zxcvbn from "zxcvbn";

// Import custom CSS for styling
import "./authentication.css";

// Functional component for the registration form
const Register = () => {
  // State to hold user's first name
  const [name, setName] = useState("");
  // State to hold user's second name
  const [secondName, setSecondName] = useState("");
  // State to hold username
  const [username, setUsername] = useState("");
  // State to hold email
  const [email, setEmail] = useState("");
  // State to hold password
  const [password, setPassword] = useState("");
  // State to hold confirm password
  const [confirmPassword, setConfirmPassword] = useState("");
  // State to hold error messages
  const [errorMessage, setErrorMessage] = useState("");
  // State to store password strength score (0 to 4)
  const [passwordScore, setPasswordScore] = useState(0);
  // Hook for navigation
  const navigate = useNavigate();

  // Handler for password input change and strength evaluation
  const handlePasswordChange = (e) => {
    const pwd = e.target.value; // Get the current password input
    setPassword(pwd); // Set the password state
    const result = zxcvbn(pwd); // Evaluate password strength
    setPasswordScore(result.score); // Set the score from result
  };

  // Function to return a color based on password strength
  const getPasswordStrengthColor = () => {
    switch (passwordScore) {
      case 0:
      case 1:
        return "red"; // Weak password
      case 2:
        return "orange"; // Fair password
      case 3:
        return "yellow"; // Good password
      case 4:
        return "green"; // Strong password
      default:
        return "gray"; // Default color if undefined
    }
  };

  // Handler function to perform registration logic
  const handleRegister = async () => {
    setErrorMessage(""); // Reset error message before validation

    // Regex pattern to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format."); // Set error if email is invalid
      return; // Exit function
    }

    // Check if required fields are empty
    if (!username || !email || !password) {
      setErrorMessage("All fields are required."); // Display error
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match."); // Display error
      return;
    }

    // Check for minimum password length
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long."); // Display error
      return;
    }

    try {
      // Attempt to create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user; // Get the user object

      // Update the user's display name with the chosen username
      await updateProfile(user, { displayName: username });

      // Create a new user document in Firestore
      const userDocRef = doc(db, "users", user.uid); // Reference to user's doc
      await setDoc(userDocRef, {
        username, // Username field
        name, // First name
        secondName, // Second name
        email, // Email
        createdAt: new Date(), // Timestamp
        uid: user.uid, // User ID
      });

      // Log success and redirect user to homepage
      console.log("Registration and Firestore write successful:", user);
      navigate("/"); // Navigate to home
    } catch (error) {
      // Catch any errors during registration
      console.error("Registration error:", error.message); // Log error
      // Handle different Firebase error codes
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMessage("Email is already in use.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email format.");
          break;
        case "auth/weak-password":
          setErrorMessage("Password is too weak. Must be at least 6 characters.");
          break;
        default:
          setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  // JSX for the registration form
  return (
    <Box
      className="login-container" // Custom CSS class
      display="flex" // Flex container
      flexDirection="column" // Vertical layout
      alignItems="center" // Center alignment
    >
      <Paper
        elevation={3} // MUI shadow effect
        className="title-box" // Custom class
        style={{
          padding: "20px", // Padding inside paper
          backgroundColor: "white", // Background color
          marginBottom: "20px", // Space below paper
          textAlign: "center", // Center text
        }}
      >
        <Typography
          variant="h4" // Header text
          className="all-audio-title" // Custom font class
          color="linear-gradient(90deg, #6a11cb, #2575fc)" // Gradient color
          fontFamily={"Montserrat, sans-serif"} // Font style
          fontWeight="bold" // Bold text
        >
          R E G I S T E R
        </Typography>
      </Paper>
      {/* First name input field */}
      <TextField
        label="First Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {/* Second name input field */}
      <TextField
        label="Second Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={secondName}
        onChange={(e) => setSecondName(e.target.value)}
      />
      {/* Username input field */}
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {/* Email input field */}
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {/* Password input field with strength handler */}
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={handlePasswordChange}
      />
      {/* Password strength indicator */}
      <Box mt={1} width="100%">
        <Typography
          variant="p"
          fontSize={12}
          style={{ color: getPasswordStrengthColor() }} // Change color based on strength
        >
          Password Strength:{" "}
          {["Weak", "Weak", "Fair", "Good", "Strong"][passwordScore]} {/* Score text */}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(passwordScore + 1) * 20} // Convert score (0–4) to percentage (20–100)
          style={{
            height: "8px",
            borderRadius: "4px",
            backgroundColor: "#e0e0e0",
            marginTop: "4px",
          }}
        />
      </Box>
      {/* Confirm password input */}
      <TextField
        label="Confirm Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {/* Submit button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        className="login-button"
      >
        Register
      </Button>
      {/* Error message display */}
      {errorMessage && (
        <Alert
          severity="error"
          className="login-error"
          icon={<ErrorIcon />} // Show error icon
          variant="filled"
        >
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
};

// Export the component as default
export default Register;
