import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";
import theme from "./theme";
import { AuthProvider } from "./contexts/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
            styles={(theme) => ({
                html: { height: "100%" },
                body: {
                    height: "100%",
                    margin: 0,
                    padding: 0,
                    background: theme.palette.background.default,
                    backgroundAttachment: "fixed",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                },
                "#root": {
                    height: "100%",
                },
            })}
        />
        <AuthProvider>
            <App />
        </AuthProvider>
    </ThemeProvider>
);