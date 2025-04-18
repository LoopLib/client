// Import React and useState hook from React
import React, { useState } from "react";

// Import UI components from Material-UI
import { Box, Button, Typography, TextField, Alert, Paper } from "@mui/material";

// Import Firebase authentication function for signing in
import { signInWithEmailAndPassword } from "firebase/auth";

// Import Firebase auth instance
import { auth } from "../firebaseConfig";

// Import navigation hook from React Router
import { useNavigate } from "react-router-dom";

// Import custom AuthContext to manage auth state globally
import { useAuth } from "./AuthContext";

// Import icon for displaying error alerts
import ErrorIcon from "@mui/icons-material/Error";

// Import custom styles for the component
import "./authentication.css";

// Functional component for the login screen
const Login = () => {
    // State to hold user's email input
    const [email, setEmail] = useState("");

    // State to hold user's password input
    const [password, setPassword] = useState("");

    // State to store any error messages
    const [errorMessage, setErrorMessage] = useState("");

    // Hook to allow redirection/navigation between pages
    const navigate = useNavigate();

    // Destructure login method from custom AuthContext
    const { login } = useAuth();

    // Function to handle login logic
    const handleLogin = async () => {
        setErrorMessage(""); // Clear any previous error messages

        // Check if both email and password fields are filled
        if (!email || !password) {
            setErrorMessage("Please fill in both fields."); // Display error if empty
            return; // Exit function early
        }

        // Regex pattern to validate proper email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage("Invalid email format."); // Show error if email is invalid
            return; // Exit function early
        }

        try {
            // Attempt to sign in using Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Extract user object from credential response
            const user = userCredential.user;

            // Log the successful login
            console.log("Login successful", user);

            // Get user's display name or fallback to 'User'
            const firstName = user.displayName || "User";

            // Call login method to update global auth context
            login({ firstName });

            // Redirect user to homepage
            navigate("/homepage");
        } catch (error) {
            // Log full error object to console
            console.error("Login error:", error);

            // Log specific error code and message
            console.log("Error code:", error.code);
            console.log("Error message:", error.message);

            // Handle known error cases with specific messages
            switch (error.code) {
                case "auth/invalid-email":
                    setErrorMessage("Invalid email format.");
                    break;
                case "auth/invalid-credential":
                    setErrorMessage("Invalid credentials provided. Please check your email and password.");
                    break;
                default:
                    // Fallback message for unexpected errors
                    setErrorMessage(`Error: ${error.message || "An unexpected error occurred. Please try again."}`);
            }
        }
    };

    // JSX return for rendering the login form
    return (
        <Box
            className="login-container" // CSS class for layout
            display="flex" // Use flexbox
            flexDirection="column" // Arrange children vertically
            alignItems="center" // Center horizontally
        >
            <Paper
                elevation={3} // Add elevation/shadow
                className="title-box" // Custom CSS class
                style={{
                    padding: "20px", // Inner spacing
                    backgroundColor: "white", // White background
                    marginBottom: "20px", // Space below
                    textAlign: "center" // Center text alignment
                }}
            >
                <Typography
                    variant="h4" // Heading level 4
                    className="all-audio-title" // Custom font class
                    color="linear-gradient(90deg, #6a11cb, #2575fc)" // Gradient color (non-standard)
                    fontFamily={"Montserrat, sans-serif"} // Custom font
                    fontWeight="bold" // Bold text
                >
                    L O G I N
                </Typography>
            </Paper>
            {/* Email input field */}
            <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update state on change
            />
            {/* Password input field */}
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update state on change
            />
            {/* Login button */}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin} // Call login function on click
                className="login-button" // Custom button style
            >
                Login
            </Button>

            {/* Conditionally render error alert if message exists */}
            {errorMessage && (
                <Alert
                    severity="error" // Error type
                    className="login-error" // Custom styling
                    icon={<ErrorIcon />} // Error icon
                    variant="filled" // Filled alert style
                >
                    {errorMessage} {/* Show actual error message */}
                </Alert>
            )}
        </Box>
    );
};

// Export Login component as default
export default Login;
