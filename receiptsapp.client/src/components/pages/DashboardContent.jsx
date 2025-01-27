import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "Mar", uv: 1500 },
    { name: "Apr", uv: 1250 },
    { name: "May", uv: 1750 },
    { name: "Jun", uv: 2200 },
    { name: "Jul", uv: 2240 },
    { name: "Aug", uv: 1900 },
];

const DashboardContent = () => {
    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    My Dashboard
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="contained">All</Button>
                    <Button variant="outlined">Withdrawal</Button>
                    <Button variant="outlined">Savings</Button>
                    <Button variant="outlined">Deposit</Button>
                </Box>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Revenue Flow
                    </Typography>
                    <Box sx={{ width: "100%", height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" stroke="#ccc" />
                                <YAxis stroke="#ccc" />
                                <Tooltip />
                                <Bar dataKey="uv" fill="#4fd1c5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6">My Card</Typography>
                    <Typography variant="h4" sx={{ mt: 2 }}>
                        $22,350.50
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        4358 4445 0968 2323 | 08/24
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default DashboardContent;