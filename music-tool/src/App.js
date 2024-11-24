import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileUpload from "./upload/upload";
import HomePage from "./homepage/homepage";
import Login from "./login/login";
import Register from "./register/register";
import Layout from "./layout/layout";
import Profile from "./profile/profile";
import { AuthProvider } from "./AuthContext";
import Edit from "./edit/edit";

function App() {
  return (
      <AuthProvider>
          <Router>
              <Layout>
                  <Routes>
                      <Route path="/" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/homepage" element={<HomePage />} />
                      <Route path="/upload" element={<FileUpload />} />
                      <Route path="/edit" element={<Edit />} />
                      <Route path="/profile" element={<Profile />} />
                  </Routes>
              </Layout>
          </Router>
      </AuthProvider>
  );
}

export default App;
