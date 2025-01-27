import React from "react";
import { Paper, Typography, Button } from "@mui/material";

const OCRResultDisplay = ({ ocrText, onClear }) => {
    if (!ocrText) return null;

    return (
        <Paper
            elevation={3}
            sx={{ p: 2, mt: 2, textAlign: "left" }}
        >
            <Typography variant="h6" gutterBottom>
                Extracted Text
            </Typography>
            <Typography
                variant="body1"
                component="pre"
                sx={{
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#f5f5f5",
                    p: 1,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    minHeight: 100,
                }}
            >
                {ocrText}
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={onClear}
                sx={{ mt: 2 }}
            >
                Clear
            </Button>
        </Paper>
    );
};

export default OCRResultDisplay;