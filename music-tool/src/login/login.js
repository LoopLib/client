import React, { useState } from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import "./login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        console.log("Logging in with:", { username, password });
        
    };

   
};

export default Login;
