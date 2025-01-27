import React, { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
} from "@mui/material";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        try {
            const response = await fetch("https://localhost:7051/api/Auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await response.json();
            const { token } = data;
            localStorage.setItem("jwtToken", token);
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Login error:", error);
            setErrorMsg(error.message);
        }
    };

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #05201A 0%, #1b664c 100%)",
            }}
        >
            <Card
                elevation={6}
                sx={{
                    width: { xs: "90%", sm: 400 },
                    borderRadius: 2,
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" mb={2} align="center" fontWeight="bold">
                        Login
                    </Typography>

                    {errorMsg && (
                        <Typography
                            color="error"
                            mb={2}
                            fontWeight="bold"
                            textAlign="center"
                        >
                            {errorMsg}
                        </Typography>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: "flex", flexDirection: "column" }}
                    >
                        <TextField
                            label="Email"
                            type="email"
                            required
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Password"
                            type="password"
                            required
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </CardContent>

                <CardActions
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        pb: 2,
                        fontSize: 14,
                    }}
                >
                    <Typography variant="body2">
                        Don&apos;t have an account? <a href="#signup">Sign Up</a>
                    </Typography>
                </CardActions>
            </Card>
        </Box>
    );
}

export default LoginPage;