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

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("https://localhost:7051/api/Auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registration failed");
            }

            const data = await response.json();
            const { token } = data || {};
            if (token) {
                localStorage.setItem("jwtToken", token);
            }

            window.location.href = "/dashboard";
        } catch (error) {
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
                        Register
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
                            label="Name"
                            type="text"
                            required
                            margin="normal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                        />

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

                        <TextField
                            label="Confirm Password"
                            type="password"
                            required
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
                        >
                            Sign Up
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
                        Already have an account? <a href="/login">Login</a>
                    </Typography>
                </CardActions>
            </Card>
        </Box>
    );
}