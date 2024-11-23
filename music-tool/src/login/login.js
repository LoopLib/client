import React, { useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Import AuthContext
import "./login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth(); // Get login function from AuthContext

    const handleLogin = async () => {
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
        }
    };

    return (
        <Box className="login-container">
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
        </Box>
    );
};

export default Login;
