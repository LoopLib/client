import React, { useState } from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import "./login.css";

const Login = () => {
    // State to store the username and password
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Function to handle the login action
    const handleLogin = () => {
        console.log("Logging in with:", { username, password });

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
