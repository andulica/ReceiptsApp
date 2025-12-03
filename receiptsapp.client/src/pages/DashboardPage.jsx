import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Card, CardContent, Toolbar } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const CustomBar = ({ x, y, width, height, fill, index, activeIndex, setActiveIndex }) => {
    const isActive = index === activeIndex;
    const barHeight = isActive ? height + 10 : height;
    const barY = isActive ? y - 10 : y;
    const barWidth = isActive ? width + 6 : width;
    const barX = isActive ? x - 3 : x;
    const barFill = isActive ? '#2ca6a4' : fill;

    return (
        <rect
            x={barX}
            y={barY}
            width={barWidth}
            height={barHeight}
            fill={barFill}
            rx={4}
            ry={4}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{ cursor: 'pointer' }}
        />
    );
};

const DashboardPage = () => {
    const [data, setData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const res = await fetch("https://localhost:7051/api/receipts", { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch receipts");
                const receipts = await res.json();

                const totalsByMonthYear = {};

                receipts.forEach(receipt => {
                    const date = new Date(receipt.purchaseDateTime);
                    const monthYearKey = date.toLocaleString('default', { month: 'short' }) + " '" + String(date.getFullYear()).slice(-2);
                    const total = parseFloat(receipt.total) || 0;

                    if (!totalsByMonthYear[monthYearKey]) {
                        totalsByMonthYear[monthYearKey] = 0;
                    }
                    totalsByMonthYear[monthYearKey] += total;
                });

                const chartData = Object.entries(totalsByMonthYear).map(([name, uv]) => ({ name, uv }));
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
                                <YAxis stroke="#ccc" tickFormatter={(value) => `RON ${value}`} />
                                <Tooltip cursor={false} formatter={(value) => `RON ${value.toFixed(2)}`} />
                                <Bar
                                    dataKey="uv"
                                    fill="#4fd1c5"
                                    shape={(props) => (
                                        <CustomBar {...props} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
                                    )}
                                />
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