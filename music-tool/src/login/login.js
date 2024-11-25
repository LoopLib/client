import React, { useState } from "react";
import { Box, Button, Typography, TextField, Alert, Paper } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Import AuthContext
import "./login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages
    const navigate = useNavigate();
    const { login } = useAuth(); // Get login function from AuthContext

    const handleLogin = async () => {
        setErrorMessage(""); // Clear previous error messages

        if (!username || !password) {
            setErrorMessage("Please fill in both fields.");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user;
            console.log("Login successful", user);

            const firstName = user.displayName || "User";

            // Update global auth state
            login({ firstName });

            navigate("/homepage");
        } catch (error) {
            console.error("Login error:", error.message);

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
                    L O G I N
                </Typography>
            </Paper>
            <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                <Alert severity="error" className="login-error">
                    {errorMessage}
                </Alert>
            )}
        </Box>
    );
};

export default Login;
