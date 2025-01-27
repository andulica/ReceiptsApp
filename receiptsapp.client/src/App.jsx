import { CssBaseline, Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import myTheme from "./theme";
import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import Footer from "./components/Footer";
import CategorizeExpensesSection from "./components/CategorizeExpensesSection";
import TopBar from "./components/TopBar";


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