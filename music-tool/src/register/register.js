// register.js
import React, { useState } from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Import Firebase auth
import { useNavigate } from "react-router-dom";
import "../login/login.css";

const Register = () => {
    // State to store the username, email, and password
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Function to handle the registration action
    const handleRegister = async () => {
        try {
            // Create a new user with the provided email and password
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("Registration successful");
            navigate("/"); // Redirect to login after registration
        } catch (error) {
            console.error("Registration error:", error.message);
        }
    };
    return (
        <Box className="login-container">
            <Typography variant="h5" className="login-title">
                REGISTER
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

            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleRegister}
                className="login-button"
            >
                Register
            </Button>
        </Box>
    );
};

export default Register;

