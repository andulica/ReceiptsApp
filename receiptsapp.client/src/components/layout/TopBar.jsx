import React, { useEffect, useRef, useState } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useScrollDirection from "../../hooks/useScrollDirection";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import Logo from "../shared/Logo";

export default function TopBar() {
    const scrollDirection = useScrollDirection();
    const [barHeight, setBarHeight] = useState(0);
    const barRef = useRef(null);

    useEffect(() => {
        if (barRef.current) {
            setBarHeight(barRef.current.offsetHeight);
        }
    }, []);

    return (
        <AppBar
            ref={barRef}
            component={motion.div}
            position="fixed"
            initial={{ y: 0 }}
            animate={{ y: scrollDirection === "down" ? -barHeight : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            sx={{
                background: "linear-gradient(360deg, #0f2027, #203a43, #2c5364)",
                boxShadow: "none",
                zIndex: 999,
                py: { xs: 1, md: 1.5 },
                width: "100%"
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* LEFT: Navigation */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Home */}
                    <Button
                        component={Link}
                        to="/"
                        sx={{
                            color: "#fff",
                            fontWeight: 600,
                            border: "1px solid rgba(255,255,255,0.3)",
                            "&:hover": {
                                borderColor: "#fff",
                                backgroundColor: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        <HomeIcon sx={{ mr: 0.5 }} />
                        Home
                    </Button>

                    {/* Dashboard */}
                    <Button
                        component={Link}
                        to="/dashboard"
                        sx={{
                            color: "#fff",
                            fontWeight: 600,
                            border: "1px solid rgba(255,255,255,0.3)",
                            "&:hover": {
                                borderColor: "#fff",
                                backgroundColor: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        <DashboardIcon sx={{ mr: 0.5 }} />
                        Dashboard
                    </Button>

                    {/* OCR */}
                    <Button
                        component={Link}
                        to="/ocr"
                        sx={{
                            color: "#fff",
                            fontWeight: 600,
                            border: "1px solid rgba(255,255,255,0.3)",
                            "&:hover": {
                                borderColor: "#fff",
                                backgroundColor: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        <CameraAltIcon sx={{ mr: 0.5 }} />
                        Take Foto Receipts
                    </Button>

                    {/* Login */}
                    <Button
                        component={Link}
                        to="/login"
                        sx={{
                            color: "#fff",
                            fontWeight: 600,
                            border: "1px solid rgba(255,255,255,0.3)",
                            "&:hover": {
                                borderColor: "#fff",
                                backgroundColor: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        <PersonIcon sx={{ mr: 0.5 }} />
                        Login
                    </Button>
                </Box>

                {/* RIGHT: Logo */}
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
                    <Logo />
                </Typography>
            </Toolbar>
        </AppBar>
    );
}