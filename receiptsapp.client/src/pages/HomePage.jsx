import React from "react";
import HeroSection from "../components/sections/HeroSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import CategorizeExpensesSection from "../components/sections/CategorizeExpensesSection";

function HomePage() {
    return (
        <>
            <HeroSection />
            <HowItWorksSection />
            <CategorizeExpensesSection />
        </>
    );
}

export default HomePage;