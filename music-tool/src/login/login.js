import React, { useState } from "react";
import { Box, Button, Typography, TextField, Alert } from "@mui/material";
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
                   sx={{
                    marginTop: '20px',
                    fontWeight: 'bold',
                    background: '#6a11cb',
                    color: 'white',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                }}
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
