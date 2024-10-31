import React, { useState } from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import "./login.css";

const Register = () => {
    // State to store the username, email, and password
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Function to handle the registration action
    const handleRegister = () => {
        console.log("Registering with:", { username, email, password });
    };

    
};

export default Register;
