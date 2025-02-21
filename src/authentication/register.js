import React, { useState } from "react";
import { Box, Button, Typography, TextField, Alert, Paper } from "@mui/material";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { db } from "../firebaseConfig"; // Import Firestore instance
import { doc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { useNavigate } from "react-router-dom";
import ErrorIcon from "@mui/icons-material/Error";
import "./authentication.css";

const Register = () => {
    const [name, setName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [errorMessage, setErrorMessage] = useState(""); // Error state
    const navigate = useNavigate();

    const handleRegister = async () => {
        setErrorMessage(""); // Clear previous error messages

          // Check if the email is a valid email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              setErrorMessage("Invalid email format.");
              return;
          }  

        // Basic validation
        if (!username || !email || !password) {
            setErrorMessage("All fields are required.");
            return;
        }

        // Check if passwords match
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with username
            await updateProfile(user, { displayName: username });

            // Add user details to Firestore
            const userDocRef = doc(db, "users", user.uid); // Create a document reference
            await setDoc(userDocRef, {
                username: username,
                name: name,
                secondName: secondName,
                email: email,
                createdAt: new Date(), // Store creation timestamp
                uid: user.uid // User's unique ID
            });

            console.log("Registration and Firestore write successful:", user);

            navigate("/"); // Redirect to login page
        } catch (error) {
            console.error("Registration error:", error.message);

            // Handle specific Firebase errors
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
        <Box className="login-container" display="flex" flexDirection="column" alignItems="center">
            <Paper
               elevation={3}
               className="title-box" 
               style={{
                   padding: "20px", 
                   backgroundColor: "white", 
                   marginBottom: "20px", 
                   textAlign: "center"
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
                onChange={(e) => setPassword(e.target.value)}
            />
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
                <Alert severity="error" className="login-error" icon={<ErrorIcon />} variant="filled">
                    {errorMessage}
                </Alert>
            )}
        </Box>
    );
};

export default Register;
