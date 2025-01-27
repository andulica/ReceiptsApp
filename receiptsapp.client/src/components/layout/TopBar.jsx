import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import Logo from "../shared/Logo"

export default function TopBar() {
    return (
        <AppBar
            position="sticky"
            component={motion.div}
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            sx={{
                background: "linear-gradient(150deg, #05201A 10%, #1b664c 90%)",
                boxShadow: "none",
                py: { xs: 1, md: 1.5 },
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* Left side: Brand */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        ml: { xs: 1, md: 2 },
                    }}
                >
                    <Logo />
                </Typography>

                {/* Right side: Nav items */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Dashboard */}
                    <Button
                        color="inherit"
                        sx={{ fontWeight: 600 }}
                        component={Link}
                        to="/dashboard"
                    >
                        <DashboardIcon sx={{ mr: 0.5 }} />
                        Dashboard
                    </Button>

                    {/* Take Photo Receipts -> goes to /ocr */}
                    <Button
                        color="inherit"
                        sx={{ fontWeight: 600 }}
                        component={Link}
                        to="/ocr"
                    >
                        <CameraAltIcon sx={{ mr: 0.5 }} />
                        Take Foto Receipts
                    </Button>

                    {/* Login -> goes to /login */}
                    <Button
                        variant="outlined"
                        sx={{
                            fontWeight: 600,
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.7)",
                            "&:hover": {
                                borderColor: "#fff",
                            },
                        }}
                        component={Link}
                        to="/login"
                    >
                        <PersonIcon sx={{ mr: 0.5 }} />
                        Login
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}