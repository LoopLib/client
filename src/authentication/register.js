import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  Paper,
  LinearProgress,
} from "@mui/material";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ErrorIcon from "@mui/icons-material/Error";
import zxcvbn from "zxcvbn"; // Import password strength estimator
import "./authentication.css";

const Register = () => {
  const [name, setName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const navigate = useNavigate();

  // Handler to update password and calculate strength
  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    const result = zxcvbn(pwd);
    setPasswordScore(result.score); // score is between 0 and 4
  };

  const getPasswordStrengthColor = () => {
    switch (passwordScore) {
      case 0:
      case 1:
        return "red";
      case 2:
        return "orange";
      case 3:
        return "yellow";
      case 4:
        return "green";
      default:
        return "gray";
    }
  };

  const handleRegister = async () => {
    setErrorMessage("");

    // Check if the email is a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format.");
      return;
    }

    if (!username || !email || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile with username
      await updateProfile(user, { displayName: username });

      // Add user details to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        username,
        name,
        secondName,
        email,
        createdAt: new Date(),
        uid: user.uid,
      });

      console.log("Registration and Firestore write successful:", user);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error.message);
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

  return (
    <Box
      className="login-container"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Paper
        elevation={3}
        className="title-box"
        style={{
          padding: "20px",
          backgroundColor: "white",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          className="all-audio-title"
          color="linear-gradient(90deg, #6a11cb, #2575fc)"
          fontFamily={"Montserrat, sans-serif"}
          fontWeight="bold"
        >
          R E G I S T E R
        </Typography>
      </Paper>
      <TextField
        label="First Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Second Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={secondName}
        onChange={(e) => setSecondName(e.target.value)}
      />
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={handlePasswordChange}
      />
      {/* Password Strength Bar */}
      <Box mt={1} width="100%">
        <Typography
          variant="p"
          fontSize={12}
          style={{ color: getPasswordStrengthColor() }}
        >
          Password Strength:{" "}
          {["Weak", "Weak", "Fair", "Good", "Strong"][passwordScore]}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(passwordScore + 1) * 20} // Convert score (0-4) to percentage
          style={{
            height: "8px",
            borderRadius: "4px",
            backgroundColor: "#e0e0e0",
            marginTop: "4px",
          }}
        />
      </Box>
      <TextField
        label="Confirm Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        className="login-button"
      >
        Register
      </Button>

      {errorMessage && (
        <Alert
          severity="error"
          className="login-error"
          icon={<ErrorIcon />}
          variant="filled"
        >
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
};

export default Register;
