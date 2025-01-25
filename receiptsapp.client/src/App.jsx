import React, { useState } from "react";
import Notification from "./components/Notification";
import OCRResultDisplay from "./components/OCRResultDisplay";
import ImageCornerSelector from "./components/ImageCornerSelector";
import { Typography, Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import DashboardContent from "./components/DashboardContent";

function App() {
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [ocrText, setOcrText] = useState("");

    const handleNotification = (message, type = "info") => {
        setNotification({ message, type });
    };

    const handleOcrResult = (text) => {
        setOcrText(text);
    };

    const clearOcrText = () => {
        setOcrText("");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
                color: "text.primary",
                overflow: "hidden",
            }}
        >
            {/* Top-level container */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    px: 3,
                    py: 3,
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Receipt Scanner MVP
                </Typography>

                <Notification message={notification.message} type={notification.type} />

                {/* Image Corner Selector */}
                <ImageCornerSelector
                    onOcrResult={handleOcrResult}
                    onNotification={handleNotification}
                />

                {/* OCR Text Display */}
                <OCRResultDisplay ocrText={ocrText} onClear={clearOcrText} />
            </Box>

            {/* Main Layout */}
            <Box
                sx={{
                    display: "flex",
                    flexGrow: 1,
                }}
            >
                {/* Sidebar */}
                <Sidebar />

                <Box
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        px: 3,
                        py: 2,
                        backgroundColor: "background.paper",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    {/* Top Bar */}
                    <TopBar />

                    {/* Dashboard Content */}
                    <DashboardContent />
                </Box>
            </Box>
        </Box>
    );
}

export default App;