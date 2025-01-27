import React, { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, Sector } from "recharts";

/** Sample data for categories */
const DATA = [
    { name: "Food", value: 400 },
    { name: "Sweets", value: 150 },
    { name: "Household", value: 250 },
    { name: "Other", value: 200 },
];

/** Colors for slices */
const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

/** Animation variants */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            // Stagger children so the chart and text appear in sequence
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

/** Custom tooltip to show currency amounts */
function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const { name, value } = payload[0];
        return (
            <Box
                sx={{
                    backgroundColor: "background.paper",
                    color: "text.primary",
                    p: 1,
                    borderRadius: 1,
                    boxShadow: 3,
                }}
            >
                <Typography variant="subtitle2">{name}</Typography>
                <Typography variant="body2">${value.toLocaleString()}</Typography>
            </Box>
        );
    }
    return null;
}

/** A simpler renderActiveShape function using Recharts <Sector> */
function renderActiveShape(props) {
    const {
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        value,
        payload,
    } = props;

    return (
        <g>
            {/* Draw the expanded sector */}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10} // expand by 10px
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            {/* Optionally, add a label at the center */}
            <text
                x={cx}
                y={cy}
                dy={8}
                textAnchor="middle"
                fill="#fff"
                style={{ fontWeight: 600 }}
            >
                {`${payload.name} - $${value.toLocaleString()}`}
            </text>
        </g>
    );
}

/** Main Pie Chart Component */
export default function CategorizeExpensesSection() {
    // Track which slice is hovered
    const [activeIndex, setActiveIndex] = useState(null);

    /** Hover handlers */
    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    return (
        <Box
            id="categorize-expenses"
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            sx={{
                py: 8,
                px: { xs: 2, md: 4 },
                backgroundColor: "background.paper",
                color: "text.primary",
            }}
        >
            <Grid container spacing={4} alignItems="center">
                {/* LEFT: Title & Description */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    component={motion.div}
                    variants={itemVariants}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <Typography variant="h3" fontWeight={700}>
                        Categorize Your Expenses
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        Group your expenses into categories like Food, Sweets, Household, and Other.
                        By visualizing your spending, you’ll quickly spot patterns and keep
                        your budget on track. Less guesswork, more clarity!
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        Below is a dynamic example. Hover over each slice to highlight it
                        and see how much you spend. You can adapt these slices to display
                        your own real data from scanned receipts.
                    </Typography>
                </Grid>

                {/* RIGHT: Chart */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        width: "100%",
                        height: 300,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={DATA}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                innerRadius={50} // donut shape
                                isAnimationActive // animate chart drawing
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                            >
                                {DATA.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        fillOpacity={index === activeIndex ? 0.9 : 0.7}
                                    />
                                ))}
                            </Pie>
                            {/* Custom tooltip & legend */}
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>
        </Box>
    );
}
