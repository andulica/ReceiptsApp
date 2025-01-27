import React, { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import MasterIllustration from "../shared/MasterIllustration";
import StepDescriptions from "./StepDescriptions";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.3 },
    },
};

const itemVariantsLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

export default function HowItWorksSection() {
    const [step, setStep] = useState(0);

    return (
        <Box
            id="how-it-works"
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            sx={{
                py: 8,
                px: 2,
                backgroundColor: "background.default",
                color: "text.primary",
                overflow: "hidden",
            }}
        >
            <Typography
                variant="h3"
                align="center"
                gutterBottom
                component={motion.div}
                variants={itemVariantsLeft}
                sx={{ mb: 4 }}
            >
                How to Scan Your Receipt
            </Typography>

            <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
                <Grid item xs={12} md={6}>
                    <MasterIllustration step={step} setStep={setStep} />
                </Grid>

                <Grid item xs={12} md={6}>
                    <StepDescriptions step={step} />
                </Grid>
            </Grid>
        </Box>
    );
}