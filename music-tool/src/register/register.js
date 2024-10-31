import React, { useState } from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import "../login/login.css";

const Register = () => {
    // State to store the username, email, and password
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Function to handle the registration action
    const handleRegister = () => {
        console.log("Registering with:", { username, email, password });
    };
    return (
        <Box className="login-container">
            <Paper className="login-paper">
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
            </Paper>
        </Box>
    );
};

export default Register;

