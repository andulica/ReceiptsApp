import React from "react";
import { Typography, Card, CardContent } from "@mui/material";

export default function MainContent() {
    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Main Dashboard
            </Typography>
            <Card>
                <CardContent>
                    <Typography variant="body1">
                        Your main content goes here.
                    </Typography>
                </CardContent>
            </Card>
        </div>
    );
}
MainContent;