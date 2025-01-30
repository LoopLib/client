import React, { useState } from "react";
import { Box, Button, Typography, TextField, Alert, Paper } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Import AuthContext
import ErrorIcon from "@mui/icons-material/Error";
import "./login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages
    const navigate = useNavigate();
    const { login } = useAuth(); // Get login function from AuthContext

    const handleLogin = async () => {
        setErrorMessage(""); // Clear previous error messages

        if (!email || !password) {
            setErrorMessage("Please fill in both fields.");
            return;
        }

        // Check if the email is a valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage("Invalid email format.");
            return;
        }

        try {
            // Attempt to sign in with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Login successful", user);

            const firstName = user.displayName || "User";

            // Update global auth state
            login({ firstName });

            navigate("/homepage");
        } catch (error) {
            console.error("Login error:", error);
            console.log("Error code:", error.code); // Log the error code
            console.log("Error message:", error.message); // Log the error message

            // Handle specific error codes from Firebase
            switch (error.code) {
                case "auth/invalid-email":
                    setErrorMessage("Invalid email format.");
                    break;
                case "auth/user-disabled":
                    setErrorMessage("This account has been disabled.");
                    break;
                case "auth/user-not-found":
                    setErrorMessage("No account found with this email.");
                    break;
                case "auth/wrong-password":
                    setErrorMessage("Incorrect password. Please try again.");
                    break;
                case "auth/invalid-credential":
                    setErrorMessage("Invalid credentials provided. Please check your email and password.");
                    break;
                default:
                    setErrorMessage(`Error: ${error.message || "An unexpected error occurred. Please try again."}`);
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
                    L O G I N
                </Typography>
            </Paper>
            <TextField
                label="Email"
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
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                className="login-button"
            >
                Login
            </Button>

            {errorMessage && (
                <Alert severity="error" className="login-error" icon={<ErrorIcon />} variant="filled">
                    {errorMessage}
                </Alert>
            )}

        </Box>
    );
};

export default Login;
