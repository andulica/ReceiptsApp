import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                p: 2,
                textAlign: "center",
                borderTop: "1px solid",
                borderColor: "divider",
            }}
        >
            <Typography variant="body2" color="text.secondary">
                © 2025 ReceiptX. All Rights Reserved.
            </Typography>
        </Box>
    );
}