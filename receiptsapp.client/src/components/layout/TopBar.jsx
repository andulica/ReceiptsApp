import React, { useEffect, useRef, useState, useContext } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import useScrollDirection from "../../hooks/useScrollDirection";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import Logo from "../shared/Logo";

import { AuthContext } from "../../contexts/AuthContext";

export default function TopBar() {
    const scrollDirection = useScrollDirection();
    const [barHeight, setBarHeight] = useState(0);
    const barRef = useRef(null);
    const navigate = useNavigate();


    const { auth, setAuth } = useContext(AuthContext);

    useEffect(() => {
        if (barRef.current) {
            setBarHeight(barRef.current.offsetHeight);
        }
    }, []);

    const handleLogout = () => {
        fetch("https://localhost:7051/api/Auth/logout", {
            method: "POST",
            credentials: 'include'
        });

        setAuth({ isAuthenticated: false, user: null });
        navigate("/");
    };

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
                width: "100%",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", gap: 2 }}>
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

                    {auth.isAuthenticated && (
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
                    )}

                    {auth.isAuthenticated && (
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
                    )}

                    {auth.isAuthenticated ? (
                        <Button
                            onClick={handleLogout}
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
                            Logout
                        </Button>
                    ) : (
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
                    )}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
                    <Logo />
                </Typography>
            </Toolbar>
        </AppBar>
    );
}