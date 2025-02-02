import React from "react";
import { CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TopBar from "./components/layout/TopBar";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import OcrPage from "./pages/OcrPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import PrivateRoute from "./components/shared/PrivateRoute";

export default function App() {
    return (
        <Router>
            <CssBaseline />
            <TopBar />  

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<HomePage />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<PrivateRoute> <DashboardPage /> </PrivateRoute>} />

                <Route path="/ocr" element={<PrivateRoute> <OcrPage /> </PrivateRoute>} />

                <Route path="/receipts" element={<PrivateRoute> <ReceiptsPage /> </PrivateRoute>} />

            </Routes>
        </Router>
    );
}