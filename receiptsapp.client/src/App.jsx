import React from "react";
import { CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TopBar from "./components/layout/TopBar";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import OcrPage from "./pages/OcrPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
    return (
        <Router>
            <CssBaseline />

            <TopBar />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/ocr" element={<OcrPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
}