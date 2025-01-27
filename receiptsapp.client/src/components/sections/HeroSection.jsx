import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { motion } from "framer-motion";


const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

const statsVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

/**
 * Example Stats Data
 */
const STATS = [
    {
        value: "40%",
        label: "Faster Expense Tracking",
    },
    {
        value: "1k+",
        label: "Satisfied Users",
    },
    {
        value: "80%",
        label: "Reduced Manual Errors",
    },
];

export default function HeroSection() {
    const handleGetStarted = () => {
        const ocrSection = document.getElementById("ocr-section");
        if (ocrSection) {
            ocrSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <Box
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{
                minHeight: { xs: "auto", md: "100vh" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                px: 2,
                py: 4,
                background: "linear-gradient(150deg, #093028 10%, #237A57 90%)",
                color: "#fff",
                textAlign: "left",
            }}
        >
            <Grid
                container
                spacing={{ xs: 2, md: 4 }}
                sx={{ maxWidth: 1200, width: "100%", my: 4 }}
            >
                {/* LEFT COLUMN (Text & Stats) */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: "2rem", md: "3rem" },
                            mb: 2,
                        }}
                    >
                        Track Expenses Seamlessly
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: "1rem", md: "1.25rem" },
                            mb: 3,
                            lineHeight: 1.5,
                        }}
                    >
                        No more manual typing from receipts.
                        Automatically extract text, categorize your spendings, and
                        stay on top of your finances with ease.
                    </Typography>

                    <Button
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variant="contained"
                        color="primary"
                        onClick={handleGetStarted}
                        sx={{ alignSelf: "start" }}
                    >
                        Get Started
                    </Button>

                    {/* Stats Row */}
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: { xs: 2, md: 4 },
                            mt: 4,
                        }}
                    >
                        {STATS.map((stat, i) => (
                            <Box
                                key={i}
                                component={motion.div}
                                variants={statsVariants}
                                sx={{ minWidth: "110px" }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 700, color: "#00c9a7" }}
                                >
                                    {stat.value}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: "rgba(255,255,255,0.8)" }}
                                >
                                    {stat.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Grid>

                {/* RIGHT COLUMN (High-res Image) */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Box
                        component="img"
                        src="/images/20943437.jpg"
                        alt="Receipt scanning preview"
                        sx={{
                            width: "100%",
                            maxWidth: 600,
                            borderRadius: 2,
                            boxShadow: 3,
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}