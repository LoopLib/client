import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileUpload from "./upload/upload";
import HomePage from "./homepage/homepage";
import Login from "./login/login";
import Register from "./register/register";
import Layout from "./layout/layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/upload" element={<FileUpload />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
