import React from "react";
import { Box } from "@mui/material";
import HeroSection from "../components/sections/HeroSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import CategorizeExpensesSection from "../components/sections/CategorizeExpensesSection";

function HomePage() {
    return (
        <Box
            sx={{
                background: "#FFFFFF",
                minHeight: "100vh",
            }}
        >
            <HeroSection />
            <HowItWorksSection />
            <CategorizeExpensesSection />
        </Box>
    );
}

export default HomePage;