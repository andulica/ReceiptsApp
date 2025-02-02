import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#00c9a7",
        },
        secondary: {
            main: "#0078d4",
        },
        background: {
            default: "linear-gradient(135deg, #05201A 0%, #1b664c 100%)",
            paper: "#1e2d2f",
        },
        text: {
            primary: "#ffffff",
            secondary: "#b0bec5",
        },
    },
    typography: {
        fontFamily: ["'Inter'", "sans-serif"].join(","),
        h4: {
            fontSize: "2rem",
            fontWeight: 700,
            color: "#ffffff",
        },
        h6: {
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#ffffff",
        },
        body1: {
            color: "#b0bec5",
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "unset",
                    backgroundColor: "#1e2d2f",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    padding: "8px 16px",
                },
                containedPrimary: {
                    backgroundColor: "#00c9a7",
                    color: "#ffffff",
                    "&:hover": {
                        backgroundColor: "#00b39c",
                    },
                },
            },
        },
    },
});

export default theme;