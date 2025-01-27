import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import myTheme from "./theme";
import TopBar from "./components/layout/TopBar";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import OcrPage from "./pages/OcrPage";
import LoginPage from "./pages/LoginPage";

function App() {
    return (
        <ThemeProvider theme={myTheme}>
            <CssBaseline />
            <Router>
                <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
                    <TopBar />

                    <Routes>
                        <Route path="/" element={<HomePage />} />

                        <Route path="/dashboard" element={<DashboardPage />} />

                        <Route path="/ocr" element={<OcrPage />} />

                        <Route path="/login" element={<LoginPage />} />
                    </Routes>

                    <Footer />
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;