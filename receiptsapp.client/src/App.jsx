import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

// Theming
import myTheme from "./theme";

// Layout
import TopBar from "./components/layout/TopBar";

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
                <TopBar />

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/ocr" element={<OcrPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;