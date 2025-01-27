import { CssBaseline, Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import myTheme from "./theme";
import HeroSection from "./components/sections/HeroSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import Footer from "./components/layout/Footer";
import CategorizeExpensesSection from "./components/sections/CategorizeExpensesSection";
import TopBar from "./components/layout/TopBar";


function App() {
    return (
        <ThemeProvider theme={myTheme}>
            <CssBaseline />
            <Box sx={{ backgroundColor: "background.default" }}>
                <TopBar />
                <HeroSection />
                <HowItWorksSection />
                <CategorizeExpensesSection />
                <Footer />
            </Box>
        </ThemeProvider>
    );
}

export default App;