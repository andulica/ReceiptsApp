import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Card, CardContent, Toolbar } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const res = await fetch("https://localhost:7051/api/receipts", {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch receipts");
                const receipts = await res.json();
                
                // Process receipts to extract total amounts and purchase dates
                const totalsByMonth = {};
                receipts.forEach(receipt => {
                    const month = new Date(receipt.PurchaseDateTime).toLocaleString('default', { month: 'short' });
                    const total = parseFloat(receipt.Total) || 0;

                    if (!totalsByMonth[month]) {
                        totalsByMonth[month] = 0;
                    }
                    totalsByMonth[month] += total;
                });

                // Convert totalsByMonth to an array for the chart
                const chartData = Object.entries(totalsByMonth).map(([name, uv]) => ({ name, uv }));
                setData(chartData);
            } catch (error) {
                console.error("Error fetching receipts:", error);
            }
        };

        fetchReceipts();
    }, []);

    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <Toolbar />
            <Toolbar />
            <Toolbar /> 

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    My Dashboard
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/receipts")}
                    >
                        Go to Receipts
                    </Button>
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

export default DashboardPage;