// login.js
import React, { useState } from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Import Firebase auth
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
    // State to store the username and password
    const [username, setUsername] = useState(""); // State to store the username 
    const [password, setPassword] = useState(""); // State to store the password
    const navigate = useNavigate(); // Get the navigate function from the useNavigate hook

    // Function to handle the login action
    const handleLogin = async () => {
        try {
            // Sign in the user with the provided username and password
            await signInWithEmailAndPassword(auth, username, password);
            console.log("Login successful");
            navigate("/homepage"); // Redirect to homepage on successful login
        } catch (error) {
            console.error("Login error:", error.message);
        }
    };
    // Return the login form
    return (
        <Box className="login-container">
            <Paper className="login-paper">
                <Typography variant="h5" className="login-title">
                    LOGIN
                </Typography>

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
            </Paper>
        </Box>
    );
};

export default Login;
